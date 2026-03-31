<?php

namespace Drupal\qna_registration\Controller;

use Drupal\Core\Controller\ControllerBase;

class MyPersonalDataController extends ControllerBase {

  /**
   * Page callback for /user/my-personal-data
   */
  public function page(): array {
    $account = $this->currentUser();
    $user = $this->entityTypeManager()->getStorage('user')->load($account->id());
    if (!$user) {
      return ['#markup' => $this->t('User not found.')];
    }
    $email = (string) $user->getEmail();

    // Find the latest submission on webform "contact" where element key "email" matches
    $connection = \Drupal::database();
    $sids = $connection->select('webform_submission_data', 'wsd')
      ->fields('wsd', ['sid'])
      ->condition('wsd.webform_id', 'neshama_registration')
      ->condition('wsd.name', 'email_address')
      ->condition('wsd.value', $email)
      ->execute()
      ->fetchCol();

    if (!$sids) {
      return ['#markup' => $this->t('No submission found.')];
    }

    // Load the submission entity
    /** @var \Drupal\webform\WebformSubmissionInterface $submission */
    $submission = $this->entityTypeManager()
      ->getStorage('webform_submission')
      ->load(reset($sids));

    $form = \Drupal::service('entity.form_builder')->getForm($submission, 'edit');

    return [
      '#theme'   => 'qna_registration_personal_data',
      '#title'   => $this->t('My personal data'),
      '#body'    => ['#markup' => ''],
      '#webform' => $form,
      '#attached' => [
        'library' => ['qna_theme/node'],
      ],
    ];
  }
}
