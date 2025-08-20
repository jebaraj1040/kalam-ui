<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Component\ComponentController;
use App\Http\Controllers\Page\PageController;
use App\Http\Controllers\Slug\SlugController;
use App\Http\Controllers\Template\TemplateController;
use App\Http\Controllers\Media\MediaController;
use App\Http\Controllers\Folder\FolderController;
use App\Http\Middleware\CheckRoutePermission;

Route::get('/', function () {
    // return Inertia::render('welcome');
    return redirect('/dashboard');
})->name('home');

/**
 * Authenticated routes
 */
Route::middleware(['auth', 'verified', CheckRoutePermission::class])->name('admin.')->group(function () {

    Route::get('dashboard', function () {
        $breadcrumbs = [
            [
                'title' =>  'Dashboard',
                'href' => route('admin.dashboard'),
            ]
        ];
        return Inertia::render('dashboard', ['breadcrumbs' => $breadcrumbs]);
    })->name('dashboard');
    /**
     * components
     */
    Route::get('/components/active', [ComponentController::class, 'getActiveComponents'])
        ->name('components.active');
    Route::resource('/components', ComponentController::class);
    Route::get('/component/import-json', [ComponentController::class, 'importJson']);
    Route::get('/component/{id}/export-json', [ComponentController::class, 'exportJson']);
    /**
     * templates
     */
    Route::resource('/templates', TemplateController::class);
    Route::get('/template/import-json', [TemplateController::class, 'importJson']);
    Route::get('/template/{id}/export-json', [TemplateController::class, 'exportJson']);
    /**
     * pages
     */
    Route::resource('pages', PageController::class);
    Route::get('/pages/fetch-components/{templateId}', [PageController::class, 'fetchTemplateComponents']);
    Route::get('/pages/{page}/revisions', [PageController::class, 'revisions'])->name('pages.revisions');
    Route::post('/pages/{page}/revisions/{revision}/revert', [PageController::class, 'revertRevision'])->name('pages.revertRevision');
    Route::get('/pages/{id}/export-xml', [PageController::class, 'exportXml']);
    /**
     * Media
     */
    Route::resource('media', MediaController::class);
    /**
     * Folder
     */
    Route::resource('folder', FolderController::class);
    Route::get('fetch-folder-list', [FolderController::class, 'fetchFolderList']);
    Route::get('/pages/fetch-components/{templateId}', [PageController::class, 'fetchTemplateComponents'])->name('check-slug');
    /**
     * slug
     */
    Route::get('/check-slug/{slug}', [SlugController::class, 'checkSlugIsTaken']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
