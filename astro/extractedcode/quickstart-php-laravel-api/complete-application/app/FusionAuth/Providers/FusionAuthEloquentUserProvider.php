<?php

declare(strict_types=1);

namespace App\FusionAuth\Providers;

use App\Models\User;
use Illuminate\Auth\EloquentUserProvider;
use Tymon\JWTAuth\Payload;

class FusionAuthEloquentUserProvider extends EloquentUserProvider
{

    /**
     * Returns a user from the provided payload
     *
     * @param \Tymon\JWTAuth\Payload $payload
     *
     * @return \App\Models\User
     */
    public function createModelFromPayload(Payload $payload): User
    {
        $email = $payload->get('email');
        /** @var \App\Models\User $model */
        $model = $this->createModel()
            ->setAttribute('id', $payload->get('sub'));
        return $model;
    }
}

