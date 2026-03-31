<?php

namespace Drupal\qna_registration\Plugin\WebformHandler;

use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\webform\Plugin\WebformHandlerBase;
use Drupal\webform\WebformSubmissionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\Url;

/**
 * Creates an unpublished Participant node from a registration submission
 *
 * Attach this handler to the "qna_registration" webform via Webform > Settings > Emails/Handlers > Add handler
 *
 * @WebformHandler(
 *   id = "qna_participant_create",
 *   label = @Translation("Create participant node"),
 *   category = @Translation("Neshama"),
 *   description = @Translation("Creates an unpublished participant node from a registration submission"),
 *   cardinality = \Drupal\webform\Plugin\WebformHandlerInterface::CARDINALITY_UNLIMITED,
 *   results = \Drupal\webform\Plugin\WebformHandlerInterface::RESULTS_PROCESSED
 * )
 */
class ParticipantCreateHandler extends WebformHandlerBase {

  /** @var \Drupal\Core\Entity\EntityTypeManagerInterface */
  protected $entityTypeManager;

  /** @var \Drupal\file\FileUsage\FileUsageInterface */
  protected $fileUsage;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    /** @var static $instance */
    $instance = parent::create($container, $configuration, $plugin_id, $plugin_definition);
    $instance->entityTypeManager = $container->get('entity_type.manager');
    $instance->fileUsage = $container->get('file.usage');
    return $instance;
  }

  /**
   * Block participant node creation if the email already exists
   */
  public function validateForm(array &$form, FormStateInterface $form_state, WebformSubmissionInterface $webform_submission) {
    if ($webform_submission->getWebform()->id() !== 'neshama_registration') {
      return;
    }

    $email = $form_state->getValue('email_address');
    if (!$email) {
      return;
    }

    $email = trim((string) $email);
    if ($email === '') {
      return;
    }

    $is_update = (bool) $form_state->get('is_update');
    if (!$is_update) {
      // Check if a participant node already exists with the same email address
      $nids = \Drupal::entityQuery('node')
        ->condition('type', 'participant')
        ->condition('field_participant_email', $email)
        ->accessCheck(TRUE)
        ->range(0, 1)
        ->execute();

      // Generate error message
      if (!empty($nids)) {
        $url = Url::fromRoute('user.login')->toString();
        $error_message = $this->t('This email already exists, please <a href=":url">log in</a>.', [
          ':url' => $url,
        ]);
        $form_state->setErrorByName('email_address', Markup::create($error_message));
      }
    }
  }

  /**
   * Create the participant node after the registration form submission or update it
   */
  public function postSave(WebformSubmissionInterface $webform_submission, $update = TRUE) {
    $webform = $webform_submission->getWebform();

    // Only for the registration webform
    $webform_id = $webform->id();
    if ($webform_id !== 'neshama_registration') {
      return;
    }

    $data = $webform_submission->getData();

    if ($update) {
      // Load node
      /** @var \Drupal\node\NodeInterface|null $node */
      $node = NULL;

      $email = isset($data['email_address']) ? trim((string) $data['email_address']) : '';
      if ($email !== '') {
        $nids = \Drupal::entityQuery('node')
          ->condition('type', 'participant')
          ->condition('field_participant_email', $email)
          ->accessCheck(TRUE)
          ->range(0, 1)
          ->execute();

        if ($nids) {
          $node = \Drupal\node\Entity\Node::load(reset($nids));
        }
      }

      if (!$node) {
        return;
      }
    } else {
      // Get current edition
      $edition_tid = \Drupal::config('qna_set_edition.settings')->get('current_edition');

      // Build admin title
      $title = trim(($data['first_name']) . ' ' . ($data['last_name']));

      // Create node
      $node = Node::create([
        'type'   => 'participant',
        'title'  => $title,
        'status' => 0, // Unpublished by default
      ]);

      // Edition
      if (!empty($edition_tid)) {
        $node->set('field_edition', ['target_id' => $edition_tid]);
      }

      // First name
      $node->set('field_participant_firstname', $data['first_name'] ?? NULL);

      // Last name
      $node->set('field_participant_lastname', $data['last_name'] ?? NULL);

      // Date of birth
      $node->set('field_participant_date_of_birth', $data['date_of_birth'] ?? NULL);

      // Email
      $node->set('field_participant_email', $data['email_address'] ?? NULL);

      // Title
      $title_value = $webform_submission->getElementData('title');
      $node->set('field_participant_title', $title_value);

      // Country
      $country_value = $webform_submission->getElementData('country');
      $country_value = is_array($country_value) ? reset($country_value) : $country_value;
      $country_term = \Drupal::entityTypeManager()
        ->getStorage('taxonomy_term')
        ->loadByProperties(['vid' => 'participants_countries', 'name' => (string) $country_value]);
      if ($country_term) {
        $node->set('field_country', ['target_id' => reset($country_term)->id()]);
      }
    }

    // About me
    $node->set('field_participant_about_me', [
      'value'  => $data['about_me'],
      'format' => 'basic_html',
    ]);

    // Profile picture
    $fid = NULL;
    $raw = $data['profile_picture'] ?? NULL;
    if (is_array($raw)) {
      $first = reset($raw);
      $fid = is_array($first) ? ($first['fid'] ?? $first['target_id'] ?? NULL) : $first;
    } else {
      $fid = $raw;
    }
    $file = NULL;
    if (!empty($fid) && is_numeric($fid)) {
      /** @var \Drupal\file\FileInterface|null $file */
      $file = \Drupal\file\Entity\File::load((int) $fid);
      if ($file) {
        if ($file->isTemporary()) {
          $file->setPermanent();
          $file->save();
        }
        $node->set('field_image', [
          'target_id' => (int) $fid,
          'alt' => 'participant picture',
        ]);
      }
    }

    // Save node
    $node->save();

    // Register file usage
    if ($file && $node->id()) {
      $this->fileUsage->add($file, 'qna_registration', 'node', (int) $node->id());
    }
  }
}
