<?php

use App\Http\Controllers\Settings\{
    ProfileController,
    PasswordController,
    RoleController,
    LanguageController
};
use App\Http\Controllers\Auth\RegisteredUserController;
// use App\Http\Controllers\Settings\MenuController;
use App\Http\Middleware\CheckRoutePermission;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', CheckRoutePermission::class])->prefix('settings')->name('settings.')->group(function () {

    Route::redirect('/', 'settings/profile');

    // Profile
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Password
    Route::get('password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    // Roles
    Route::get('role', [RoleController::class, 'index'])->name('roles.index');
    Route::get('role/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('role', [RoleController::class, 'store'])->name('roles.store');
    Route::get('role/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('role/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('role/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    Route::get('users', [RegisteredUserController::class, 'index'])->name('users.index');
    Route::get('user/add', [RegisteredUserController::class, 'add'])->name('users.add');
    Route::post('user', [RegisteredUserController::class, 'userstore'])->name('users.store');
    Route::get('user/{user}/edit', [RegisteredUserController::class, 'edit'])->name('users.edit');
    Route::put('user/{user}', [RegisteredUserController::class, 'update'])->name('users.update');
    Route::delete('user/{user}', [RegisteredUserController::class, 'destroy'])->name('users.destroy');

    // Route::get('/settings/menu', [MenuController::class, 'index'])->name('menu.index');
    // Route::get('/settings/menu/add', [MenuController::class, 'add'])->name('menu.add');
    // Route::post('/settings/menu/', [MenuController::class, 'store'])->name('menu.store');
    // Route::get('settings/menu/{menu}/edit', [MenuController::class, 'edit'])->name('menu.edit');
    //  Route::put('settings/menu/{menu}', [MenuController::class, 'update'])->name('menu.update');
    // Route::delete('settings/menu/{menu}', [MenuController::class, 'destroy'])->name('menu.destroy');

    // Appearance
    Route::get('appearance', fn() => Inertia::render('settings/appearance'))->name('appearance');

    // Languages
    Route::resource('languages', LanguageController::class)->names('languages');
    Route::patch('languages/{language}/set-default', [LanguageController::class, 'setDefault']);
});
