<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        $client = $this->route('client');
        return $client
            ? ($this->user()?->can('update', $client) ?? false)
            : ($this->user()?->can('create', User::class) ?? false);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim((string) $this->input('name')),
            'email' => trim((string) $this->input('email')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('client'))],
            'password' => [$this->isMethod('post') ? 'required' : 'nullable', 'string', 'min:8', 'max:255', 'confirmed'],
            'role' => ['prohibited'],
        ];
    }
}
