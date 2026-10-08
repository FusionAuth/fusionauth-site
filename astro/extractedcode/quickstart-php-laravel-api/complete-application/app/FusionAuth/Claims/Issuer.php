<?php

declare(strict_types=1);

namespace App\FusionAuth\Claims;

use Tymon\JWTAuth\Claims\Issuer as BaseIssuerClaim;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class Issuer extends BaseIssuerClaim
{
    private string $expectedValue;

    /**
     * @throws \Tymon\JWTAuth\Exceptions\TokenInvalidException
     */
    public function validatePayload(): bool
    {
        if (!$this->validate()) {
            throw new TokenInvalidException('Issuer (iss) invalid');
        }

        return true;
    }

    private function validate(): bool
    {
        // Issuer must be set
        $value = $this->getValue();
        if (empty($value)) {
            return false;
        }

        if (!isset($this->expectedValue)) {
            $this->expectedValue = \strtolower(config('app.fusionauth.url'));
        }

        // If we have specified valid values, we check if the current issue is present there
        if (empty($this->expectedValue)) {
            return false;
        }

        return \strtolower($value) === $this->expectedValue;
    }
}

