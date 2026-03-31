<?php

namespace Drupal\neshama_registration\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\user\Entity\User;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;

/**
 * Moderation form shown on a Participant node tab.
 */
class ParticipantModerationForm extends FormBase {

  /** @var \Drupal\node\NodeInterface|null */
  protected ?NodeInterface $node = NULL;

  /**
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * @var \Drupal\Core\Mail\MailManagerInterface
   */
  protected $mailManager;

  /**
   * Constructs a new ParticipantModerationForm
   */
  public function __construct(RouteMatchInterface $route_match, MailManagerInterface $mail_manager) {
    $this->routeMatch = $route_match;
    $this->mailManager = $mail_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('current_route_match'),
      $container->get('plugin.manager.mail')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'neshama_registration_participant_moderation';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $node = $this->routeMatch->getParameter('node');
    if ($node instanceof NodeInterface) {
      $this->node = $node;
    }

    // Only for Participant nodes
    if (!$this->node || $this->node->bundle() !== 'participant') {
      $form['msg'] = ['#markup' => $this->t('This page is only available for Participant content.')];
      return $form;
    }

    // Only for unpublished nodes
    if ($this->node->isPublished()) {
      $form['msg'] = ['#markup' => $this->t('This participant is already published.')];
      return $form;
    }

    $form['info'] = [
      '#type' => 'item',
      '#title' => $this->t('Moderate registration'),
      '#markup' => $this->t(
        'Participant: <strong>@title</strong> (NID @nid) — Status: <em>@status</em>',
        [
          '@title' => $this->node->label(),
          '@nid' => $this->node->id(),
          '@status' => $this->node->isPublished() ? $this->t('Published') : $this->t('Unpublished'),
        ]
      ),
    ];

    $form['actions'] = ['#type' => 'actions'];

    $form['actions']['accept'] = [
      '#type' => 'submit',
      '#value' => $this->t('Accept registration'),
      '#button_type' => 'primary',
      '#submit' => ['::submitAccept'],
    ];

    $form['actions']['refuse'] = [
      '#type' => 'submit',
      '#value' => $this->t('Refuse registration'),
      '#button_type' => 'danger',
      '#submit' => ['::submitRefuse'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    
  }

  /**
   * Accept the participant
   */
  public function submitAccept(array &$form, FormStateInterface $form_state): void {
    if ($this->node) {
      $this->node->setPublished(TRUE)->save();
      $this->sendModerationEmails('accept');
      $this->messenger()->addStatus($this->t('Accepted: @title', ['@title' => $this->node->label()]));
      $form_state->setRedirect('entity.node.canonical', ['node' => $this->node->id()]);
    }
  }

  /**
   * Refuse the participant
   */
  public function submitRefuse(array &$form, FormStateInterface $form_state): void {
    if ($this->node) {
      $this->sendModerationEmails('refuse');
      $this->messenger()->addWarning($this->t('Refused: @title', ['@title' => $this->node->label()]));
      $form_state->setRedirect('entity.node.canonical', ['node' => $this->node->id()]);
    }
  }

  /**
   * Create the user and build the password reset link
   */
  private function getPasswordSetLinkForEmail(string $email): ?string {
    $email = trim($email);
    if ($email === '') {
      return NULL;
    }

    // Load or create the account
    /** @var \Drupal\user\UserStorageInterface $storage */
    $storage = \Drupal::entityTypeManager()->getStorage('user');
    $accounts = $storage->loadByProperties(['mail' => $email]);
    /** @var \Drupal\user\UserInterface $account */
    $account = $accounts ? reset($accounts) : NULL;

    if (!$account) {
      // Create the user with its email as username
      $account = User::create([
        'name'   => $email,
        'mail'   => $email,
        'status' => 1,
      ]);
      $account->addRole('participant');
      $account->save();
    }

    // Build a one-time password reset URL
    return user_pass_reset_url($account);
  }

  /**
   * Send moderation email to participant
   */
  protected function sendModerationEmails(string $action): void {
    $module = 'neshama_registration';
    $langcode = \Drupal::currentUser()->getPreferredLangcode();
    $send = TRUE;
    $to = $this->node->get('field_participant_email')->value ?? '';
    $first = $this->node->get('field_participant_firstname')->value ?? '';
    $last  = $this->node->get('field_participant_lastname')->value ?? '';
    $full  = trim("$first $last");
    $base_url = \Drupal::request()->getSchemeAndHttpHost();

    if ($action == 'accept') {
      $link = $this->getPasswordSetLinkForEmail($to) ?: \Drupal::url('<front>', [], ['absolute' => TRUE]);
      $params = [
        'message' => t("
<p>
  <strong>Hello @full,</strong>
</p>
<p>
  We are pleased to confirm your registration on the Neshama website.
</p>
<p>
  You now need to confirm your access and choose your password by clicking on the following link:<br>
  @link
</p>
<p>
  Neshama team<br>
  Mémorial de la Shoah<br>
  <a href=\"@base_url\">www.neshama.com</a>
</p>
<p>
  Neshama is the data controller of your data. We collect and process your data to manage our relationship with you. We retain your data for a period of 3 years after our last contact with you.
</p>
<p>
  In accordance with the French Data Protection Act of 6 January 1978, as amended, and the GDPR of 27 April 2016, you have the right to access, rectify, erase, object, and restrict processing. You can exercise this right by contacting the following address, attaching a document proving your identity: Shoah Memorial, 17 rue Geoffroy l'Asnier – 75004 Paris.
</p>
      ", [
          '@link' => $link,
          '@full' => $full,
          '@base_url' => $base_url,
        ]),
      ];
      $this->mailManager->mail($module, 'participant_accept', $to, $langcode, $params, NULL, $send);
    } else {
      $params = [
        'message' => t("
<p>
    <strong>Hello @full,</strong>
</p>
<p>
  We regret to inform you that your registration could not be approved by our team.
</p>
<p>
  If you wish to submit a complaint, please contact us using the contact form.
</p>
<p>
  Neshama team<br>
  Mémorial de la Shoah<br>
  <a href=\"@base_url\">www.neshama.com</a>
</p>
<p>
  Neshama is the data controller of your data. We collect and process your data to manage our relationship with you. We retain your data for a period of 3 years after our last contact with you.
</p>
<p>
  In accordance with the French Data Protection Act of 6 January 1978, as amended, and the GDPR of 27 April 2016, you have the right to access, rectify, erase, object, and restrict processing. You can exercise this right by contacting the following address, attaching a document proving your identity: Shoah Memorial, 17 rue Geoffroy l'Asnier – 75004 Paris.
</p>
      ", [
          '@full' => $full,
          '@base_url' => $base_url,
        ]),
      ];
      $this->mailManager->mail($module, 'participant_refuse', $to, $langcode, $params, NULL, $send);
    }
  }
}