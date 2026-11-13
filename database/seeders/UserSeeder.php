<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['Администратор', 'admin@example.com', UserRole::Admin],
            ['Дмитрий Соколов', 'dmitry@example.com', UserRole::Client],
            ['Анна Смирнова', 'anna@example.com', UserRole::Client],
            ['Михаил Петров', 'mikhail@example.com', UserRole::Client],
            ['Елена Волкова', 'elena@example.com', UserRole::Client],
            ['Андрей Козлов', 'andrey@example.com', UserRole::Client],
        ];

        foreach ($users as [$name, $email, $role]) {
            $user = User::firstOrNew(['email' => $email]);

            $user->name = $name;
            $user->role = $role;

            if (!$user->exists) {
                $user->password = Hash::make('password123');
            }

            $user->save();
        }
    }
}
