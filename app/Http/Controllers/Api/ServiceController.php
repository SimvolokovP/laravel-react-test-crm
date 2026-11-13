<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\IndexServicesRequest;
use App\Http\Requests\SaveServiceRequest;
use Illuminate\Support\Facades\Gate;
use App\Http\Resources\ServiceResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    public function destroy(Service $service): \Illuminate\Http\Response
    {
        Gate::authorize('delete', $service);
        $this->deleteServices([$service->id]);
        return response()->noContent();
    }

    public function bulkDestroy(\Illuminate\Http\Request $request): \Illuminate\Http\Response
    {
        Gate::authorize('viewAny', Service::class);
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:services,id'],
        ]);
        $this->deleteServices($validated['ids']);
        return response()->noContent();
    }

    private function deleteServices(array $ids): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($ids) {
            $services = Service::whereIn('id', $ids)->lockForUpdate()->get();
            foreach ($services as $service) {
                Gate::authorize('delete', $service);
                if ($service->orders()->exists()) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'ids' => 'Нельзя удалить услуги, используемые в заказах. Деактивируйте их. Удаление отменено.',
                    ]);
                }
            }
            Service::whereIn('id', $ids)->delete();
        });
    }

    public function show(Service $service): ServiceResource
    {
        Gate::authorize('view', $service);
        return new ServiceResource($service);
    }

    public function store(SaveServiceRequest $request): ServiceResource
    {
        return new ServiceResource(Service::create($request->validated()));
    }

    public function update(SaveServiceRequest $request, Service $service): ServiceResource
    {
        $service->update($request->validated());
        return new ServiceResource($service);
    }

    public function index(IndexServicesRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $services = Service::query();
        $search = mb_strtolower(trim($filters['search'] ?? ''), 'UTF-8');
        if ($search !== '') {
            $connection = $services->getConnection();
            $lower = 'LOWER';
            if ($connection->getDriverName() === 'sqlite') {
                $connection->getPdo()->sqliteCreateFunction('unicode_lower', fn ($value) => mb_strtolower($value ?? '', 'UTF-8'), 1);
                $lower = 'unicode_lower';
            }
            $services->where(function ($query) use ($search, $lower) {
                $query->whereRaw("{$lower}(name) LIKE ?", ['%'.$search.'%'])
                    ->orWhereRaw("{$lower}(description) LIKE ?", ['%'.$search.'%']);
            });
        }
        if (isset($filters['is_active'])) $services->where('is_active', $filters['is_active']);
        $sort = $filters['sort'] ?? 'id';
        $services->orderBy($sort, $filters['direction'] ?? 'desc');
        if ($sort !== 'id') $services->orderBy('id', 'desc');

        return ServiceResource::collection($services->paginate($filters['per_page'] ?? 10)->withQueryString());
    }

    public function options(): JsonResponse
    {
        $services = Service::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'price']);

        return response()->json([
            'data' => $services,
        ]);
    }
}
