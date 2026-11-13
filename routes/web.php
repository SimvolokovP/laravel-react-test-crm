<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::middleware('guest')->post('/login', [
    AuthController::class,
    'login',
]);

Route::middleware('auth')->post('/logout', [
    AuthController::class,
    'logout',
]);


Route::get('/{any?}', fn() => view('app'))
    ->where('any', '^(?!api(?:/|$)).*');
