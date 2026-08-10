<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FusionAuth OpenID and PKCE example</title>
    <link rel="stylesheet" href="changebank.css" />
</head>
<body>
<div id="page-container">
    <div id="page-header">
        <div id="logo-header">
            <img src="changebank.svg" />
            <div class="h-row">
                <p class="header-email">{{$email}}</p>
                <a class="button-lg" href="/logout"> Logout </a>
            </div>
        </div>

        <div id="menu-bar" class="menu-bar">
            <a class="menu-link inactive" href="/change">Make Change</a>
            <a class="menu-link" href="/account">Account</a>
        </div>
    </div>

    <div style="flex: 1;">
        <!-- Application page -->
        <div class="column-container">
            <div class="app-container">
                <h3>Your balance</h3>
                <div class="balance">$0.00</div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
