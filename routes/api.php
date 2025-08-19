<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PageController;
use App\Http\Middleware\ApiLogger;

Route::prefix('v1')
    ->middleware(['api', ApiLogger::class])
    ->group(function () {

        Route::post('/login', [AuthController::class, 'login'])->name('login');
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api')->name('logout');
        Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:api')->name('refresh');

        Route::middleware('auth:api')->group(function () {
            Route::get('/get-page/{slug}/{lang}', [PageController::class, 'index'])->name('page');
        });
    });
