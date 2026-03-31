<?php

namespace Drupal\qna_custom_login_redirection\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

class LoginRouteSubscriber extends RouteSubscriberBase {

  protected function alterRoutes(RouteCollection $collection) {

    // On cible la route qui redirige après login.
    if ($route = $collection->get('user.login_status')) {

      // On remplace la destination par la page que tu veux.
      $route->setDefault('_controller', '\Drupal\qna_custom_login_redirection\Controller\LoginRedirectController::handle');
    }
  }
}
