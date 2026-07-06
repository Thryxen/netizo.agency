<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create
        {--name= : Imię i nazwisko administratora}
        {--email= : Adres e-mail (login do panelu)}
        {--password= : Hasło (min. 8 znaków)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tworzy konto administratora z dostępem do panelu';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = $this->option('name') ?: text(
            label: 'Imię i nazwisko',
            required: true,
        );

        $email = $this->option('email') ?: text(
            label: 'Adres e-mail',
            required: true,
        );

        $password = $this->option('password') ?: password(
            label: 'Hasło',
            required: true,
        );

        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->components->error($error);
            }

            return self::FAILURE;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ]);

        $this->components->info("Utworzono administratora: {$user->email}");
        $this->components->info('Zaloguj się na: '.url('/admin'));

        return self::SUCCESS;
    }
}
