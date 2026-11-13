<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->isMethod('put')) {
            return $this->user()?->can('update', $this->route('order')) ?? false;
        }

        return $this->user()?->can('create', \App\Models\Order::class) ?? false;
    }

    public function rules(): array
    {
        $isAdmin = $this->user()?->role === UserRole::Admin;

        return [
            'user_id' => [
                $isAdmin ? 'required' : 'prohibited',
                'integer',
                Rule::exists('users', 'id')
                    ->where('role', UserRole::Client->value),
            ],

            'service_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'service_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('services', 'id')
                    ->where('is_active', true),
            ],

            'amount' => ['prohibited'],
            'status' => $this->isMethod('put') && $isAdmin
                ? ['sometimes', 'required', Rule::enum(OrderStatus::class)]
                : ['prohibited'],
        ];
    }
}
