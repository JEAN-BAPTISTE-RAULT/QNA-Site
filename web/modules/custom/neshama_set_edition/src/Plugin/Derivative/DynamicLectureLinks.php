<?php

namespace Drupal\neshama_set_edition\Plugin\Derivative;

use Drupal\Component\Plugin\Derivative\DeriverBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\Discovery\ContainerDeriverInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides dynamic lecture menu links
 */
class DynamicLectureLinks extends DeriverBase implements ContainerDeriverInterface {

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

    $edition_tid = \Drupal::config('neshama_set_edition.settings')->get('current_edition');

    $lectures = $this->entityTypeManager->getStorage('node')->loadByProperties([
      'type' => 'lecture',
      'status' => 1,
      'field_edition' => $edition_tid,
    ]);

    $cache_tags = ['config:neshama_set_edition.settings'];

    foreach ($lectures as $lecture) {
      $nid = $lecture->id();
      $this->derivatives["lecture_$nid"] = [
        'title' => $lecture->label(),
        'route_name' => 'entity.node.canonical',
        'route_parameters' => ['node' => $nid],
        'menu_name' => 'main',
        'weight' => 0,
        'parent' => 'menu_link_content:c9924a72-94a7-4a4c-94f5-f2e0a59e7711',
        'cache_tags' => $cache_tags,
      ] + $base_plugin_definition;
    }

    return $this->derivatives;
  }
}