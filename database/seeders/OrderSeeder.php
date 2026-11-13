<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $orders = [
            [
                'email' => 'dmitry@example.com',
                'services' => ['Техническое обслуживание'],
                'status' => OrderStatus::New ,
            ],
            [
                'email' => 'anna@example.com',
                'services' => ['Диагностика автомобиля'],
                'status' => OrderStatus::InProgress,
            ],
            [
                'email' => 'mikhail@example.com',
                'services' => ['Замена тормозных колодок'],
                'status' => OrderStatus::InProgress,
            ],
            [
                'email' => 'elena@example.com',
                'services' => ['Сезонный шиномонтаж'],
                'status' => OrderStatus::Completed,
            ],
            [
                'email' => 'andrey@example.com',
                'services' => ['Замена масла', 'Замена фильтров'],
                'status' => OrderStatus::Completed,
            ],
        ];

        foreach ($orders as $index => $item) {
            DB::transaction(function () use ($item, $index) {
                $user = User::where('email', $item['email'])
                    ->firstOrFail();

                $services = Service::whereIn(
                    'name',
                    $item['services']
                )->get();

                if ($services->count() !== count($item['services'])) {
                    throw new \RuntimeException(
                        'Не найдены все услуги для заказа'
                    );
                }

                $amount = $services->sum('price');

                // Фиксированные ID только для локальных тестовых данных.
                $order = Order::updateOrCreate(
                    ['id' => 1048 - $index],
                    [
                        'user_id' => $user->id,
                        'status' => $item['status'],
                        'amount' => $amount,
                    ]
                );

                $pivot = $services->mapWithKeys(
                    fn(Service $service) => [
                        $service->id => [
                            'price' => $service->price,
                        ],
                    ]
                )->all();

                $order->services()->sync($pivot);
            });
        }
    }
}
