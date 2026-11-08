<?php

declare(strict_types = 1);

namespace Drupal\changebank\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Returns responses for changebank routes.
 */
class ChangebankController extends ControllerBase {

  /**
   * Builds the response.
   */
  public function build() {
    $build = [];
    $form = $this->formBuilder()->getForm('\Drupal\changebank\Form\ChangebankForm');
    $build['form'] = $form;
    return $build;
  }

  /**
   * Displays the form submission value on the account page.
   */
  public function accountBalance() {
    $value = \Drupal::state()->get('changebank_form_value');
    $arguments = ($value) ? $value->getArguments() : [];
    $dollars = $arguments['@dollars'] ?? 0;
    return [
      '#markup' => '<span class="account-balance">$' . $dollars . '</span>',
      '#cache' => [
        'contexts' => [
          'session',
        ],
        'max-age' => 0,
      ],
    ];
  }

}
