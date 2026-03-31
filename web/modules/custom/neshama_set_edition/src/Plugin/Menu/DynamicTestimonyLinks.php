<?php

namespace Drupal\neshama_set_edition\Plugin\Menu;

use Drupal\Core\Menu\MenuLinkDefault;

/**
 * Dummy base class for dynamic lecture links.
 *
 * This class is required to declare the menu link plugin.
 */
class DynamicTestimonyLinks extends MenuLinkDefault {
  public function getCacheTags() {
    return ['config:neshama_set_edition.settings'];
  }

  public function getCacheContexts() {
    return [];
  }

  public function getCacheMaxAge() {
    return 0;
  }
}