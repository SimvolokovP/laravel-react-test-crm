<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [
        AuthController::class,
        'me',
    ]);

    Route::get('/orders', [
        OrderController::class,
        'index',
    ]);

    Route::get('/clients', [ClientController::class, 'index']);
    Route::get('/clients/options', [ClientController::class, 'options']);
    Route::get('/clients/{client}', [ClientController::class, 'show']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::put('/clients/{client}', [ClientController::class, 'update']);

    Route::get('/services', [ServiceController::class, 'index']);

    Route::post('/orders', [OrderController::class, 'store'])
        ->middleware('can:create,App\Models\Order');

    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
});
