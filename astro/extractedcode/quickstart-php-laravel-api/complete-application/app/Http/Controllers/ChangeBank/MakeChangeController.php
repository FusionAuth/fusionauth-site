<?php

namespace App\Http\Controllers\ChangeBank;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

use function response;

class MakeChangeController extends Controller
{
    /**
     * Make Change entrypoint for the ChangeBank API.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function __invoke(): Response
    {
        $this->checkRoles('teller', 'customer');

        $total = (float) request()->query('total', 0);
        $output = $this->makeChange($total);

        return response()->json($output);
    }

    protected function makeChange(float $total): array
    {
        if ($total <= 0) {
            return [
                'Message' => 'Please provider a total parameter greater than 0.',
            ];
        }

        $message = 'We can make change using';
        $remainingAmount = $total;

        $coins = [
            'quarters' => 0.25,
            'dimes' => 0.10,
            'nickels' => 0.05,
            'pennies' => 0.01,
        ];

        $output = [
            'Message' => $message,
            'Change'  => [],
        ];

        foreach ($coins as $coinName => $value) {
            $coinCount = intval($remainingAmount / $value);
            $remainingAmount = round(($remainingAmount - $coinCount * $value) * 100) / 100;
            $output['Message'] .= " {$coinCount} {$coinName}";
            $output['Change'][] = ['Denomination' => $coinName, 'Count' => $coinCount];
        }

        return $output;
    }
}

