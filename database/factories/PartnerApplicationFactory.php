<?php

namespace Database\Factories;

use App\Http\Requests\StorePartnerApplicationRequest;
use App\Models\PartnerApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PartnerApplication>
 */
class PartnerApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'locale' => 'pl',
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->optional()->numerify('+48 ### ### ###'),
            'partner_type' => fake()->randomElement(StorePartnerApplicationRequest::PARTNER_TYPES),
            'message' => fake()->optional()->paragraph(),
        ];
    }

    /**
     * A lead sent from the English site (/en).
     */
    public function english(): static
    {
        return $this->state(fn (array $attributes): array => ['locale' => 'en']);
    }
}
