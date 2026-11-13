<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function update(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [
            UserRole::Admin,
            UserRole::Client,
        ], true);
    }

    public function view(User $user, Order $order): bool
    {
        return $user->role === UserRole::Admin
            || (
                $user->role === UserRole::Client
                && $order->user_id === $user->id
            );
    }
}
