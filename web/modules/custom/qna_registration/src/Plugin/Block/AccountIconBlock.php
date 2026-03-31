<?php

namespace Drupal\qna_registration\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Url;

/**
 * Provides an account icon with conditional behavior
 *
 * @Block(
 *   id = "qna_registration_account_icon",
 *   admin_label = @Translation("Account icon (login / user actions)")
 * )
 */
class AccountIconBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $account = \Drupal::currentUser();

    $build = [
      '#theme' => 'qna_registration_account_icon',
      '#logged_in' => $account->isAuthenticated(),
      '#login_url' => Url::fromRoute('user.login')->toString(),
      '#attached' => [
        'library' => [
          'qna_registration/account_icon',
        ],
      ],
    ];

    if ($account->isAuthenticated()) {
      // Load full user entity
      /** @var \Drupal\user\UserInterface $user */
      $user = \Drupal::entityTypeManager()->getStorage('user')->load($account->id());

      $build['#items'] = [
        [
          'title' => t('My personal data'),
          'url' => Url::fromRoute('qna_registration.my_personal_data')->toString(),
        ],
        [
          'title' => t('Delete my account'),
          'url' => Url::fromRoute('entity.user.cancel_form', ['user' => $user->id()])->toString(),
        ],
        [
          'title' => t('Log out'),
          'url' => Url::fromRoute('user.logout')->toString(),
        ],
      ];
    }

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    return AccessResult::allowed();
  }
}
