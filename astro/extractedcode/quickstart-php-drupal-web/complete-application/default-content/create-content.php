<?php

/**
 * @file
 * Creates the Changebank content that configuration can't carry.
 *
 * config/sync holds the site's configuration, but content entities and
 * uploaded files live in the database and the files directory. This script
 * recreates them with their original UUIDs, so blocks and menus that point at
 * them keep working. It skips anything that already exists, so it's safe to
 * run more than once.
 *
 * Run it with: vendor/bin/drush php:script default-content/create-content.php
 */

use Drupal\Core\File\FileSystemInterface;

$repository = \Drupal::service('entity.repository');
$storage = fn(string $type) => \Drupal::entityTypeManager()->getStorage($type);

$create = function (string $type, array $values) use ($repository, $storage) {
  if ($repository->loadEntityByUuid($type, $values['uuid'])) {
    return;
  }
  $storage($type)->create($values)->save();
};

// The front page is /node/1, so this has to be the first node created.
$create('node', [
  'uuid' => 'c3482ff1-2142-4295-8a0c-7b39c8d0b95d',
  'type' => 'page',
  'title' => 'Home',
  'status' => 1,
  'uid' => 1,
]);

$create('block_content', [
  'uuid' => '359b791f-777a-4da7-9ed0-850da22be1e1',
  'type' => 'basic',
  'info' => 'Homepage Block',
  'body' => [
    'value' => '<h2 style="color:#096324;">Welcome to Changebank</h2><p>To get started, log in or create a new account.</p>',
    'format' => 'full_html',
  ],
]);

// "Home" came from the standard install profile; the site installs with the minimal profile, so it's created here.
$menu_links = [
  ['0f5b3c62-7d4e-4b1a-9c2e-5a8d3f6b1e90', 'main', 'Home', 'internal:/', -50],
  ['30d3c4a4-d5b9-419b-b30a-4861a738aed5', 'main', 'About', 'internal:/', -47],
  ['f37a0034-1c95-4880-9547-ea8cfa3c84c3', 'main', 'Services', 'internal:/', -48],
  ['fcae35c2-d924-45cf-a33d-9ba97d98a92c', 'main', 'Products', 'internal:/', -49],
  ['be95c9df-166a-4a80-a8d2-eb189d1a7e7c', 'changebank-menu', 'Account', 'internal:/account', 0],
  ['3d763e4a-b86c-4484-bae4-e76759f21d8e', 'changebank-menu', 'Make Change', 'internal:/makechange', 0],
];
foreach ($menu_links as [$uuid, $menu, $title, $uri, $weight]) {
  $create('menu_link_content', [
    'uuid' => $uuid,
    'menu_name' => $menu,
    'title' => $title,
    'link' => ['uri' => $uri],
    'weight' => $weight,
    'expanded' => 0,
  ]);
}

// The theme's logo setting points at public://changebank-logo.png, and the front page shows money-new.jpg.
$file_system = \Drupal::service('file_system');
foreach (['changebank-logo.png', 'money-new.jpg'] as $name) {
  $file_system->copy(__DIR__ . '/files/' . $name, 'public://' . $name, FileSystemInterface::EXISTS_REPLACE);
}
