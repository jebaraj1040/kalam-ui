<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Site;
use Illuminate\Support\Facades\Log;

class SiteController extends Controller
{
    public array $breadcrumbs;

    public function __construct()
    {
        $this->breadcrumbs = [
            [
                'title' => 'Dashboard',
                'href' => route('admin.dashboard'),
            ],
            [
                'title' => 'Sites',
                'href' => route('admin.sites.index'),
            ],
        ];
    }

    public function index(): Response
    {
        Log::info('Inside ' . __METHOD__);

        return Inertia::render('site/index', [
            'breadcrumbs' => $this->breadcrumbs,
            'sites' => Site::orderBy('created_at', 'desc')->paginate(10),
        ]);
    }
    public function create(): Response
    {
        Log::info('Inside ' . __METHOD__);

        $breadcrumbs = [
            [
                'title' =>  'Create',
                'href' => route('admin.sites.create'),
            ]
        ];
        return Inertia::render('site/create', ['breadcrumbs' => $this->breadcrumbs + $breadcrumbs]);
    }
    public function store(Request $request): RedirectResponse
    {
        Log::info('Inside ' . __METHOD__);

        $site = Site::create($request->all());
        Log::info('Site created', ['site' => $site->toArray()]);

        return Redirect::route('admin.sites.index')->with('success', 'Site has been created successfully');
    }
}
