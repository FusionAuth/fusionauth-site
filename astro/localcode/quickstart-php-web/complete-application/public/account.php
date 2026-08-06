<?php
verifySession();

function verifySession() {
    session_start();
    if (!isset($_SESSION['id'])) {
        header('Location: login.php');
        exit;
    }
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
        <a class="menu-link inactive" href="change.php">Make Change</a>
        <a class="menu-link" href="account.php">Account</a>
      </div>
    </div>

    <div style="flex: 1;">
      <div class="column-container">
        <div class="app-container">
          <h3>Your balance</h3>
          <div class="balance">$0.00</div>
        </div>
      </div>
    </div>
</body>
</html>
