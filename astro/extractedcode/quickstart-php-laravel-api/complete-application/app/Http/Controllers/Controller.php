<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Gate;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    protected function checkRoles(string ...$roles): void
    {
        /** @var \Tymon\JWTAuth\Payload $payload */
        $payload = auth('web')->payload();
        $rolesFromJwt = (array) $payload->get('roles');

        $hasAtLeastOneRole = false;
        foreach ($roles as $role) {
            foreach ($rolesFromJwt as $roleFromJwt) {
                if ($roleFromJwt === $role) {
                    $hasAtLeastOneRole = true;
                    break;
                }
            }
        }
        if (!$hasAtLeastOneRole) {
            throw new AuthorizationException('Proper role not found for user.');
        }
    }
}
