<?php

declare(strict_types=1);

namespace App\FusionAuth;

use App\FusionAuth\Providers\FusionAuthEloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\JWTGuard as TymonJWTGuard;

class FusionAuthJwtGuard extends TymonJWTGuard
{

    /**
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function user(): ?Authenticatable
    {
        // Calling the default method that will retrieve existing users
        $user = parent::user();
        if ($user !== null) {
            return $user;
        }

        // Otherwise, we'll use the custom FusionAuth user provider to create a user from the JWT
        if (!$this->provider instanceof FusionAuthEloquentUserProvider) {
            return null;
        }

        try {
            $payload = $this->jwt->getPayload();
            if (empty($payload)) {
                return null;
            }
            $this->user = $this->provider->createModelFromPayload($payload);
            $this->user->save();
            return $this->user;
        } catch (JWTException) {
            return null;
        }
    }

}

