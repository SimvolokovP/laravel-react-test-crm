<?php

namespace App\Http\Requests;

use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;

class SaveServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $service = $this->route('service');
        return $service
            ? ($this->user()?->can('update', $service) ?? false)
            : ($this->user()?->can('create', Service::class) ?? false);
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => trim((string) $this->input('name'))]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
