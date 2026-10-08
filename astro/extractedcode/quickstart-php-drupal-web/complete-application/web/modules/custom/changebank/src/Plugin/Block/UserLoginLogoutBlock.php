<?php

declare(strict_types = 1);

namespace Drupal\changebank\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a block that displays linked text for anonymous users.
 *
 * @Block(
 *   id = "user_login_logout_block",
 *   admin_label = @Translation("User Login Logout Block")
 * )
 */
class UserLoginLogoutBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * Constructs a new UserLoginLogoutBlock object.
   *
   * @param array $configuration
   *   The block configuration.
   * @param string $plugin_id
   *   The block plugin ID.
   * @param mixed $plugin_definition
   *   The block plugin definition.
   * @param \Drupal\Core\Session\AccountInterface $current_user
   *   The current user.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, AccountInterface $current_user) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('current_user')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $roles = $this->currentUser->getRoles();
    if (in_array('anonymous', $roles)) {
      return [
        '#markup' => $this->t('<button class="btn btn-primary"><a href="/user/login">Log in</a></button>'),
      ];
    }
    else {
        return [
            '#markup' => $this->t('<button class="btn btn-primary"><a href="/user/logout">Logout</a></button>'),
        ];
    }
  }

}
