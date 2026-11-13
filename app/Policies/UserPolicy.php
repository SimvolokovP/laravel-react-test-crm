<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $client): bool
    {
        return $user->isAdmin() && $client->role === UserRole::Client;
    }

    public function view(User $user, User $client): bool
    {
        return $user->isAdmin() && $client->role === UserRole::Client;
    }

    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }
}
