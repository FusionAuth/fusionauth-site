<?php

declare(strict_types=1);

namespace App\FusionAuth\Providers;

use App\FusionAuth\Claims\Audience;
use App\FusionAuth\Claims\Issuer;
use App\FusionAuth\FusionAuthJwtGuard;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Tymon\JWTAuth\Http\Parser\Cookies;

class FusionAuthServiceProvider extends ServiceProvider
{

    public function boot(): void
    {
        Auth::provider('fusionauth_eloquent', function (Application $app, array $config) {
            return new FusionAuthEloquentUserProvider($this->app['hash'], $config['model']);
        });
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            $guard = new FusionAuthJwtGuard(
                $app['tymon.jwt'],
                $app['auth']->createUserProvider($config['provider']),
                $app['request']
            );

            $app->refresh('request', $guard, 'setRequest');

            return $guard;
        });

        /** @var \Tymon\JWTAuth\Claims\Factory $factory */
        $factory = $this->app['tymon.jwt.claim.factory'];
        $factory->extend('iss', Issuer::class);
        $factory->extend('aud', Audience::class);

        /** @var \Tymon\JWTAuth\Http\Parser\Parser $parsers */
        $parsers = $this->app['tymon.jwt.parser'];
        foreach ($parsers->getChain() as $parser) {
            if ($parser instanceof Cookies) {
                $parser->setKey('app_at');
                break;
            }
        }
    }

}

