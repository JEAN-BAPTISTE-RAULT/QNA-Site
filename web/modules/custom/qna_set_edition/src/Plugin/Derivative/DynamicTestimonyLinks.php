<?php

namespace Drupal\qna_set_edition\Plugin\Derivative;

use Drupal\Component\Plugin\Derivative\DeriverBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\Discovery\ContainerDeriverInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides dynamic testimony menu links
 */
class DynamicTestimonyLinks extends DeriverBase implements ContainerDeriverInterface {

  protected $entityTypeManager;

  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  public static function create(ContainerInterface $container, $base_plugin_id) {
    return new static(
      $container->get('entity_type.manager')
    );
  }

  public function getDerivativeDefinitions($base_plugin_definition) {
    $this->derivatives = [];

    $edition_tid = \Drupal::config('qna_set_edition.settings')->get('current_edition');

    $testimonies = $this->entityTypeManager->getStorage('node')->loadByProperties([
      'type' => 'testimony',
      'status' => 1,
      'field_edition' => $edition_tid,
    ]);

    $cache_tags = ['config:qna_set_edition.settings'];

    foreach ($testimonies as $testimony) {
      $nid = $testimony->id();
      $this->derivatives["testimony_$nid"] = [
        'title' => $testimony->label(),
        'route_name' => 'entity.node.canonical',
        'route_parameters' => ['node' => $nid],
        'menu_name' => 'main',
        'weight' => 0,
        'parent' => 'menu_link_content:b208fbf1-e7f3-426d-9f28-cb2297dc158a',
        'cache_tags' => $cache_tags,
      ] + $base_plugin_definition;
    }

    return $this->derivatives;
  }
}
