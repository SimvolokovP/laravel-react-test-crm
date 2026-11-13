<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\IndexClientsRequest;
use App\Http\Requests\SaveClientRequest;
use App\Http\Resources\ClientResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    public function store(SaveClientRequest $request): ClientResource
    {
        $client = new User($request->safe()->only(['name', 'email', 'password']));
        $client->role = UserRole::Client;
        $client->save();

        return new ClientResource($client);
    }

    public function update(SaveClientRequest $request, User $client): ClientResource
    {
        $data = $request->validated();
        if ($client->email !== $data['email']) $client->email_verified_at = null;
        $client->fill(collect($data)->only(['name', 'email'])->all());
        if (!empty($data['password'])) $client->password = $data['password'];
        $client->save();

        return new ClientResource($client);
    }

    public function show(User $client): ClientResource
    {
        Gate::authorize('view', $client);
        return new ClientResource($client);
    }

    public function index(IndexClientsRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $clients = User::query()->where('role', UserRole::Client->value);
        $search = mb_strtolower(trim($filters['search'] ?? ''), 'UTF-8');
        if ($search !== '') {
            $connection = $clients->getConnection();
            $lower = 'LOWER';
            if ($connection->getDriverName() === 'sqlite') {
                $connection->getPdo()->sqliteCreateFunction('unicode_lower', fn ($value) => mb_strtolower($value ?? '', 'UTF-8'), 1);
                $lower = 'unicode_lower';
            }
            $clients->where(function ($query) use ($search, $lower) {
                $query->whereRaw("{$lower}(name) LIKE ?", ['%'.$search.'%'])
                    ->orWhereRaw("{$lower}(email) LIKE ?", ['%'.$search.'%']);
            });
        }
        $sort = $filters['sort'] ?? 'id';
        $clients->orderBy($sort, $filters['direction'] ?? 'desc');
        if ($sort !== 'id') $clients->orderBy('id', 'desc');

        return ClientResource::collection($clients
            ->paginate($filters['per_page'] ?? 10, ['id', 'name', 'email', 'created_at'])
            ->withQueryString());
    }

    public function options(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $clients = User::query()
            ->where('role', UserRole::Client->value)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json([
            'data' => $clients,
        ]);
    }
}
