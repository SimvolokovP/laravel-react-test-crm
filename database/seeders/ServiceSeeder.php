<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['Техническое обслуживание', 18500],
            ['Диагностика автомобиля', 4500],
            ['Замена тормозных колодок', 12000],
            ['Сезонный шиномонтаж', 6000],
            ['Замена масла', 8500],
            ['Компьютерная диагностика', 3500],
            ['Замена фильтров', 2500],
        ];

        foreach ($services as [$name, $price]) {
            Service::updateOrCreate(
                ['name' => $name],
                [
                    'price' => $price,
                    'is_active' => true,
                ]
            );
        }
    }
}
