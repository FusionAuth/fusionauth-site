<?php

hideErrorsInBrowser();
loadAllModules();
loadEnvironmentVariables();
$provider = getFusionAuthProvider();
startSafeSession();
redirectToAccountPageIfAlreadyLoggedIn();
redirectUserToFusionAuthIfNotLoggedIn($provider);
checkCSRFToken();
handleFusionAuthCallback($provider);
exit;

function hideErrorsInBrowser() {
    ini_set('display_errors', 0);
    ini_set('log_errors', '1');
    ini_set('error_log', 'php://stderr');
}

function loadAllModules() {
    require_once __DIR__ . '/../vendor/autoload.php';
}

function loadEnvironmentVariables() {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
}

function startSafeSession() {
    $cookieParams = [
        'lifetime' => 0, // 0 means "until the browser is closed"
        'path' => '/', // entire site can use this cookie
        // 'domain' => '', // Set your domain here
        'secure' => false, // true for HTTPS, false for HTTP
        'httponly' => true, // true to make the cookie accessible only through the HTTP protocol
        'samesite' => 'Strict' // None, Lax, or Strict
    ];
    session_set_cookie_params($cookieParams);
    session_start();
}

function getFusionAuthProvider(): object {
    $fusionAuthClientId =     $_ENV['FUSIONAUTH_CLIENT_ID']     ?? getenv('FUSIONAUTH_CLIENT_ID');
    $fusionAuthClientSecret = $_ENV['FUSIONAUTH_CLIENT_SECRET'] ?? getenv('FUSIONAUTH_CLIENT_SECRET');
    $fusionAuthServerUrl =    $_ENV['FUSIONAUTH_SERVER_URL']    ?? getenv('FUSIONAUTH_SERVER_URL');
    $fusionAuthBrowserUrl =   $_ENV['FUSIONAUTH_BROWSER_URL']   ?? getenv('FUSIONAUTH_BROWSER_URL');
    $fusionAuthRedirectUrl =  $_ENV['FUSIONAUTH_REDIRECT_URL']  ?? getenv('FUSIONAUTH_REDIRECT_URL');

    $provider = new \JerryHopper\OAuth2\Client\Provider\FusionAuth([
        'clientId'          => $fusionAuthClientId,
        'clientSecret'      => $fusionAuthClientSecret,
        'redirectUri'       => $fusionAuthRedirectUrl,
        'urlAuthorize'            => $fusionAuthBrowserUrl . '/oauth2/authorize',
        'urlAccessToken'          => $fusionAuthServerUrl . '/oauth2/token',
        'urlResourceOwnerDetails' => $fusionAuthServerUrl . '/oauth2/userinfo',
    ]);
    return $provider;
}

function redirectToAccountPageIfAlreadyLoggedIn() {
    if (isset($_SESSION['id'])) {
        header('Location: account.php');
        exit;
    }
}

function redirectUserToFusionAuthIfNotLoggedIn($provider) {
    if (isset($_GET['code']))
        return;
    $options = [
        'scope' => ['openid email profile']
    ];
    $authUrl = $provider->getAuthorizationUrl($options);
    $_SESSION['oauth2state'] = $provider->getState();
    header('Location: '.$authUrl);
    exit;
}

function checkCSRFToken() {
    if (empty($_GET['state']) || (!\hash_equals($_SESSION['oauth2state'], $_GET['state']))) {
        unset($_SESSION['oauth2state']);
        exit('Invalid CSRF state');
    }
}

function handleFusionAuthCallback($provider) {
    $token = $provider->getAccessToken('authorization_code', ['code' => $_GET['code']]);
    try {
        $user = $provider->getResourceOwner($token);
        $userArray = $user->toArray();

        $email = $user->getEmail();
        $name = $userArray['given_name'];

        session_regenerate_id();
        $_SESSION['id'] = $user->getId();
        $_SESSION['email'] = $email;
        $_SESSION['name'] = $name;
        header('Location: account.php');
    }
    catch (Exception $e) {
        exit('Failed to get user details from FusionAuth');
    }
}
