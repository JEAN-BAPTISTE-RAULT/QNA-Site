<?php

namespace Drupal\qna_custom_login_redirection\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Routing\CurrentRouteMatch;
use Symfony\Component\HttpFoundation\RedirectResponse;

class LoginRedirectSubscriber implements EventSubscriberInterface {

  protected $currentUser;
  protected $routeMatch;

  public function __construct(AccountProxyInterface $current_user, CurrentRouteMatch $route_match) {
    $this->currentUser = $current_user;
    $this->routeMatch = $route_match;
  }

  public static function getSubscribedEvents() {
    return [
      KernelEvents::REQUEST => ['onRequest', -100],
    ];
  }

  public function onRequest(RequestEvent $event) {

    // On ne redirige que les utilisateurs authentifiés.
    if ($this->currentUser->isAuthenticated()) {

      // Routes de profil utilisateur.
      $route = $this->routeMatch->getRouteName();
      if (in_array($route, ['user.page', 'entity.user.canonical'])) {

        // Redirection vers la page souhaitée.
        $event->setResponse(new RedirectResponse('/'));
      }
    }
  }
}
