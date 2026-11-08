<?php

namespace App\Providers;

// :snippet-start: a
use Illuminate\Support\ServiceProvider;
// :snippet-end:
use Illuminate\Support\Facades\Event;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    // :snippet-start: b
    public function boot(): void
    {
        Event::listen(\SocialiteProviders\Manager\SocialiteWasCalled::class,
                      \SocialiteProviders\FusionAuth\FusionAuthExtendSocialite::class . '@handle'
        );
    }
    // :snippet-end:
}
