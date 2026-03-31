<?php

namespace Drupal\neshama_set_edition\Plugin\views\argument_default;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\views\Plugin\views\argument_default\ArgumentDefaultPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;

/**
 * Default argument plugin to provide the current edition.
 *
 * @ViewsArgumentDefault(
 *   id = "current_edition",
 *   title = @Translation("Current Edition from config")
 * )
 */
class CurrentEdition extends ArgumentDefaultPluginBase implements ContainerFactoryPluginInterface {

  protected ConfigFactoryInterface $configFactory;

  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $config_factory) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configFactory = $config_factory;
  }

  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory')
    );
  }

  public function getArgument() {
    return $this->configFactory->get('neshama_set_edition.settings')->get('current_edition');
  }
}