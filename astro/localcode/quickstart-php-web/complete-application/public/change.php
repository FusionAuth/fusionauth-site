<?php
verifySession();
handleCSRFToken();
$state = calculateChange();

function verifySession() {
    session_start();
    if (!isset($_SESSION['id'])) {
        header('Location: login.php');
        exit;
    }
}

function handleCSRFToken() {
  if ($_SERVER['REQUEST_METHOD'] === 'GET')
    $_SESSION["csrftoken"] = bin2hex(random_bytes(32));
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && !\hash_equals($_SESSION["csrftoken"], $_POST["csrftoken"]))
    exit;
  elseif ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET')
    exit;
}

function calculateChange(): array {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST')
    return [];
  $amount = $_POST["amount"];
  $state = [
      'iserror' => false,
      'hasChange' => true,
      'total' => '',
      'nickels' => '',
      'pennies' => '',
  ];
  $total = floor(floatval($amount) * 100) / 100;
  $state['total'] = is_nan($total) ? '' : number_format($total, 2);
  $nickels = floor($total / 0.05);
  $state['nickels'] = number_format($nickels);
  $pennies = ($total - (0.05 * $nickels)) / 0.01;
  $state['pennies'] = ceil(floor($pennies * 100) / 100);
  $state['iserror'] = !preg_match('/^(\d+(\.\d*)?|\.\d+)$/', $amount);
  return $state;
}
?>

<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>FusionAuth OpenID and PKCE example</title>
  <link rel="stylesheet" href="static/changebank.css">
</head>
<body>
  <div id="page-container">
    <div id="page-header">
      <div id="logo-header">
        <img src="static/changebank.svg"  alt="logo"/>
        <div class="h-row">
          <p class="header-email"><?= $_SESSION['email'] ?></p>
          <a class="button-lg" href="logout.php" onclick="">Logout</a>
        </div>
      </div>

      <div id="menu-bar" class="menu-bar">
        <a class="menu-link" href="change.php">Make Change</a>
        <a class="menu-link inactive" href="account.php">Account</a>
      </div>
    </div>

    <div style="flex: 1;">
      <div class="column-container">
        <div class="app-container change-container">
          <h3>We Make Change</h3>

<!-- GET REQUEST ------------------------------------------------>
<?php if ($_SERVER['REQUEST_METHOD'] === 'GET'): ?>
          <div class="change-message">Please enter a dollar amount:</div>
          <form method="post" action="change.php">
            <input type="hidden" name="csrftoken" value="<?= $_SESSION["csrftoken"] ?>" />
            <div class="h-row">
              <div class="change-label">Amount in USD: $</div>
              <input class="change-input" name="amount" value="" />
              <input class="change-submit" type="submit" value="Make Change" />
            </div>
          </form>
<?php else: ?>
<!-- POST REQUEST ----------------------------------------------->
            <?php if ($state['iserror']): ?>
            <div class="error-message">Please enter a dollar amount:</div>
            <?php else: ?>
            <div class="change-message">
              We can make change for <?= $state['total'] ?> with <?= $state['nickels'] ?> nickels and <?= $state['pennies'] ?> pennies!
            </div>
            <?php endif; ?>

          <form method="post" action="change.php">
            <input type="hidden" name="csrftoken" value="<?= $_SESSION["csrftoken"] ?>" />
            <div class="h-row">
              <div class="change-label">Amount in USD: $</div>
              <input class="change-input" name="amount" value="<?= htmlspecialchars($_POST["amount"]) ?>" />
              <input class="change-submit" type="submit" value="Make Change" />
            </div>
          </form>
<?php endif; ?>

        </div>
      </div>
    </div>
</body>
</html>
