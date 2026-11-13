<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'client' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],

            'services' => $this->services->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'price' => $service->pivot->price,
            ]),

            'amount' => $this->amount,

            'status' => $this->status->value,
            'status_label' => $this->status->label(),

            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
