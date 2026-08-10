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
            <a class="menu-link" href="/change">Make Change</a>
            <a class="menu-link inactive" href="/account">Account</a>
        </div>
    </div>

    <div style="flex: 1;">
        <div class="column-container">
            <div class="app-container change-container">
                <h3>We Make Change</h3>

                @if ($state['error'] && $state['hasChange'])
                    <div class="error-message">Please enter a dollar amount</div>
                @endif

                @if (!$state['hasChange'])
                    <div class="error-message"></div>
                @endif

                @if (!$state['error'] && $state['hasChange'])
                    <div class="change-message">
                        We can make change for {{ $state['total'] }} with {{ $state['nickels'] }} nickels and {{ $state['pennies'] }} pennies!
                    </div>
                @endif

                <form method="post" action="/change">
                    @csrf
                    <div class="h-row">
                        <div class="change-label">Amount in USD: $</div>
                        <input class="change-input" name="amount" value="0.00" />
                        <input class="change-submit" type="submit" value="Make Change" />
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
</body>

</html>
