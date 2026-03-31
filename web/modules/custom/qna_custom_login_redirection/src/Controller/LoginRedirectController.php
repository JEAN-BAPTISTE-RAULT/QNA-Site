<?php

namespace Drupal\qna_custom_login_redirection\Controller;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Controller\ControllerBase;

class LoginRedirectController extends ControllerBase {

  protected $currentUser;

  public function __construct(AccountProxyInterface $current_user) {
    $this->currentUser = $current_user;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('current_user')
    );
  }

  public function redirectAfterLogin() {

    // Si l'utilisateur est connecté → redirection custom
    if ($this->currentUser->isAuthenticated()) {
      return new RedirectResponse('/');
    }

    // Sinon → comportement normal
    return new RedirectResponse('/user/login');
  }
}
