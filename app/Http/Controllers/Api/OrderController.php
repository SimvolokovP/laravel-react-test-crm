<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class OrderController extends Controller
{
    public function update(StoreOrderRequest $request, Order $order): OrderResource
    {
        Gate::authorize('update', $order);
        $validated = $request->validated();

        DB::transaction(function () use ($order, $validated) {
            $services = Service::query()->whereIn('id', $validated['service_ids'])
                ->where('is_active', true)->get();
            $order->update([
                'user_id' => $validated['user_id'],
                'amount' => $services->sum('price'),
                'status' => $validated['status'] ?? $order->status,
            ]);
            $order->services()->sync($services->mapWithKeys(
                fn(Service $service) => [$service->id => ['price' => $service->price]]
            )->all());
        });

        return new OrderResource($order->load(['user', 'services']));
    }

    public function destroy(Order $order): \Illuminate\Http\Response
    {
        Gate::authorize('delete', $order);
        DB::transaction(function () use ($order) {
            $order->services()->detach();
            $order->delete();
        });

        return response()->noContent();
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', \Illuminate\Validation\Rule::in([10, 15, 20])],
            'client_id' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', \Illuminate\Validation\Rule::enum(OrderStatus::class)],
            'amount_min' => ['nullable', 'numeric', 'min:0'],
            'amount_max' => ['nullable', 'numeric', 'min:0', ...($request->filled('amount_min') ? ['gte:amount_min'] : [])],
            'sort' => ['sometimes', \Illuminate\Validation\Rule::in(['id', 'client', 'amount', 'status'])],
            'direction' => ['sometimes', \Illuminate\Validation\Rule::in(['asc', 'desc'])],
        ]);

        $orders = Order::query()
            ->when(
                !$request->user()->isAdmin(),
                fn($query) => $query->where('user_id', $request->user()->id)
            )
            ->with(['user', 'services']);

        $search = trim($filters['search'] ?? '');
        if ($search !== '') {
            $orders->where(function ($query) use ($search) {
                $query->whereHas('user', function ($user) use ($search) {
                    $connection = $user->getConnection();
                    $lower = 'LOWER';
                    if ($connection->getDriverName() === 'sqlite') {
                        $connection->getPdo()->sqliteCreateFunction(
                            'unicode_lower',
                            fn($value) => mb_strtolower($value ?? '', 'UTF-8'),
                            1
                        );
                        $lower = 'unicode_lower';
                    }
                    $user->whereRaw("{$lower}(name) LIKE ?", ['%' . mb_strtolower($search, 'UTF-8') . '%']);
                });
                $number = ltrim($search, '#');
                if (ctype_digit($number) && strlen($number) <= 18) {
                    $query->orWhere('id', $number);
                }
            });
        }

        if (!empty($filters['client_id']))
            $orders->where('user_id', $filters['client_id']);
        if (!empty($filters['status']))
            $orders->where('status', $filters['status']);
        if (isset($filters['amount_min']))
            $orders->where('amount', '>=', $filters['amount_min']);
        if (isset($filters['amount_max']))
            $orders->where('amount', '<=', $filters['amount_max']);

        $sort = $filters['sort'] ?? 'id';
        $direction = $filters['direction'] ?? 'desc';
        if ($sort === 'client') {
            $orders->orderBy(\App\Models\User::select('name')->whereColumn('users.id', 'orders.user_id'), $direction);
        } elseif ($sort === 'status') {
            $orders->orderByRaw("CASE status WHEN 'new' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'completed' THEN 2 WHEN 'cancelled' THEN 3 END " . $direction);
        } else {
            $orders->orderBy($sort, $direction);
        }
        if ($sort !== 'id')
            $orders->orderBy('id', 'desc');

        $orders = $orders->paginate($filters['per_page'] ?? 10)->withQueryString();

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): OrderResource
    {
        $validated = $request->validated();

        $clientId = $request->user()->role === UserRole::Admin
            ? $validated['user_id']
            : $request->user()->id;

        $order = DB::transaction(function () use ($validated, $clientId) {
            $services = Service::query()
                ->whereIn('id', $validated['service_ids'])
                ->where('is_active', true)
                ->get();

            $order = Order::create([
                'user_id' => $clientId,
                'amount' => $services->sum('price'),
                'status' => OrderStatus::New ,
            ]);

            $pivotData = $services->mapWithKeys(
                fn(Service $service) => [
                    $service->id => [
                        'price' => $service->price,
                    ],
                ]
            )->all();

            $order->services()->attach($pivotData);

            return $order;
        });

        return new OrderResource(
            $order->load(['user', 'services'])
        );
    }

    public function show(Order $order): OrderResource
    {
        Gate::authorize('view', $order);

        return new OrderResource(
            $order->load(['user', 'services'])
        );
    }
}
