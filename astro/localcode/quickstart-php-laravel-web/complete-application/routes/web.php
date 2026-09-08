<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;


Route::get('/', function () {
    if (auth()->check())
        return redirect('/account');
    return view('index');
});


Route::get('/login', function () {
     return Socialite::driver('fusionauth')->redirect();
})->name('login');


Route::get('/auth/callback', function () {
    /** @var \SocialiteProviders\Manager\OAuth2\User $user */
    $user = Socialite::driver('fusionauth')->user();
    $user = User::updateOrCreate([
        'fusionauth_id' => $user->id,
    ], [
        'name' => $user->name,
        'email' => $user->email,
        'fusionauth_access_token' => $user->token,
        'fusionauth_refresh_token' => $user->refreshToken,
    ]);
    Auth::login($user);
    return redirect('/account');
});


Route::get('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
});


Route::get('/account', function () {
    return view('account', ['email' => Auth::user()->email]);
})->middleware('auth');


Route::get('/change', function () {
    $state = [
        'error' => false,
        'hasChange' => false,
        'total' => '',
        'nickels' => '',
        'pennies' => '',
    ];
    return view('change', ['state' => $state, 'email' => Auth::user()->email]);
})->middleware('auth');


Route::post('/change', function (Request $request) {
    $amount = $request->input('amount');
    $state = [
        'error' => false,
        'hasChange' => true,
        'total' => '',
        'nickels' => '',
        'pennies' => '',
    ];

    $total = round(floatval($amount) * 100);
    $state['total'] = is_nan($total) ? '' : number_format($total / 100, 2);

    $nickels = intdiv((int)$total, 5);
    $state['nickels'] = number_format($nickels);

    $pennies = (int)$total % 5;
    $state['pennies'] = $pennies;

    $state['error'] = !preg_match('/^(\d+(\.\d*)?|\.\d+)$/', $amount);

    return view('change', ['state' => $state, 'email' => Auth::user()->email]);
})->middleware('auth');