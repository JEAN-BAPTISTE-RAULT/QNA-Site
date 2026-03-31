<?php

namespace Drupal\neshama_set_edition\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class CurrentEditionForm extends ConfigFormBase {

  public function getFormId() {
    return 'current_edition_form';
  }

  protected function getEditableConfigNames() {
    return ['neshama_set_edition.settings'];
  }

  public function buildForm(array $form, FormStateInterface $form_state) {
    $terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadTree('edition');
    $options = [];
    foreach ($terms as $term) {
      $options[$term->tid] = $term->name;
    }

    $config = $this->config('neshama_set_edition.settings');
    $form['current_edition'] = [
      '#type' => 'select',
      '#title' => $this->t('Current Edition'),
      '#options' => $options,
      '#default_value' => $config->get('current_edition'),
      '#required' => TRUE,
    ];

    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('neshama_set_edition.settings')
      ->set('current_edition', $form_state->getValue('current_edition'))
      ->save();
    
    \Drupal::service('plugin.cache_clearer')->clearCachedDefinitions();
    \Drupal::service('router.builder')->rebuild();
    \Drupal::service('cache_tags.invalidator')->invalidateTags(['config:neshama_set_edition.settings']);
    \Drupal::service('cache.render')->deleteAll();

    parent::submitForm($form, $form_state);
  }
}