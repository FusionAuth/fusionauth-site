<?php

declare(strict_types = 1);

namespace Drupal\changebank\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a form for creating change from an amount in US dollars.
 */
class ChangebankForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'changebank_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $result = $form_state->get('result');

    $form['result_wrapper'] = [
      '#type' => 'container',
      '#attributes' => [
        'class' => ['changebank-result-wrapper'],
      ],
    ];

    if ($form_state->get('result')) {
      $form['result_wrapper']['result'] = [
        '#markup' => $result,
      ];
    }

    $form['amount'] = [
      '#type' => 'number',
      '#title' => $this->t('Amount in USD: $'),
      '#required' => TRUE,
      '#min' => 0,
      '#step' => 0.01,
    ];
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Make Change'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $amount = $form_state->getValue('amount');

    $amount_in_cents = round($amount * 100);

    $quarters = floor($amount_in_cents / 25);
    $amount_in_cents %= 25;

    $dimes = floor($amount_in_cents / 10);
    $amount_in_cents %= 10;

    $nickels = floor($amount_in_cents / 5);
    $amount_in_cents %= 5;

    $pennies = $amount_in_cents;

    $coins = [];
    if ($quarters > 0) {
      $coins[] = "@quarters quarters";
    }
    if ($dimes > 0) {
      $coins[] = "@dimes dimes";
    }
    if ($nickels > 0) {
      $coins[] = "@nickels nickels";
    }
    if ($pennies > 0) {
      $coins[] = "@pennies pennies";
    }

    $result = $this->t('We can make change for $@dollars with ' . implode(', ', $coins) . '!', [
      '@dollars' => $amount,
      '@quarters' => $quarters,
      '@dimes' => $dimes,
      '@nickels' => $nickels,
      '@pennies' => $pennies,
    ]);

    $form_state->setRebuild(TRUE);
    $form_state->set('result', $result);

    \Drupal::state()->set('changebank_form_value', $result);
  }

}
