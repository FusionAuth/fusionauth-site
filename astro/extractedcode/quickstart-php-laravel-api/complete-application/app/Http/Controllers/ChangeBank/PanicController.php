<?php

namespace App\Http\Controllers\ChangeBank;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

use function intval;
use function request;
use function response;
use function round;

class PanicController extends Controller
{
    /**
     * Panic entrypoint for the ChangeBank API.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function __invoke(): Response
    {
        $this->checkRoles('teller');

        return response()->json([
            'message' => "We've called the police!",
        ]);
    }
}

