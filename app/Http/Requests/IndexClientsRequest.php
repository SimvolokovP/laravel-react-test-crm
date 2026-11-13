<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexClientsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', User::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => [
                'sometimes',
                Rule::in(['id', 'name', 'email', 'created_at']),
            ],
            'direction' => [
                'sometimes',
                Rule::in(['asc', 'desc']),
            ],
            'per_page' => [
                'sometimes',
                'integer',
                Rule::in([10, 15, 20]),
            ],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
