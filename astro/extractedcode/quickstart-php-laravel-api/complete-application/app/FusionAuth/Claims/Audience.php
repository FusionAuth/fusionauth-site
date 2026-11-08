<?php

declare(strict_types=1);

namespace App\FusionAuth\Claims;

use Tymon\JWTAuth\Claims\Audience as BaseAudienceClaim;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class Audience extends BaseAudienceClaim
{
    private string $expectedValue;

    /**
     * @throws \Tymon\JWTAuth\Exceptions\TokenInvalidException
     */
    public function validatePayload(): bool
    {
        if (!$this->validate()) {
            throw new TokenInvalidException('Audience (aud) invalid');
        }

        return true;
    }

    private function validate(): bool
    {
        // Audience must be set
        $value = $this->getValue();
        if (empty($value)) {
            return false;
        }

        if (!isset($this->expectedValue)) {
            $this->expectedValue = \strtolower(config('app.fusionauth.client_id'));
        }

        if (empty($this->expectedValue)) {
            return false;
        }

        // If we have specified valid values, we check if the current audience is present there
        return \strtolower($value) === $this->expectedValue;
    }
}

