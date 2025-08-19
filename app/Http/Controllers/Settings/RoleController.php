<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\Menu;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class RoleController extends Controller
{
     protected $permissions = [];

        public function __construct(Request $request)
        {
            $this->permissions = $request->get('permissions', []);
        }

    public function index()
    {
        Log::info('Permissions received in controller role:', ['permissions' => $this->permissions]);
        $roles = Role::all();

        $userCountsRaw = User::raw(function ($collection) {
            return $collection->aggregate([
                ['$group' => ['_id' => '$role_id', 'total' => ['$sum' => 1]]]
            ]);
        });

        $userCounts = [];
        foreach ($userCountsRaw as $item) {
            $userCounts[(string)$item->_id] = $item->total;
        }

        $roles->transform(function ($role) use ($userCounts) {
            $role->user_count = $userCounts[(string)$role->_id] ?? 0;
            return $role;
        });

        return Inertia::render('settings/roles/role-view', [
            'roles' => $roles->map(function ($role) {
                return [
                    'id' => (string) $role->_id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'user_count' => $role->user_count ?? 0,
                ];
            }),
            'permissions' => $this->permissions,
        ]);
    }

    // public function create()
    // {
    //     $menus = Menu::all()->map(function ($menu) {
    //         return [
    //             'id' => (string) $menu->_id,
    //             'name' => $menu->name,
    //         ];
    //     });

    //     return Inertia::render('settings/roles/role-add', [
    //         'menus' => $menus,
    //     ]);
    // }
    public function create()
    {
        $excludedControllers = [
            'Laravel\Sanctum\Http\Controllers',
            "App\Http\Controllers\Api\AuthController",
            'App\Http\Controllers\Api\PageController',
            'App\Http\Controllers\Auth\AuthenticatedSessionController'
        ];

        $allRoutes = collect(Route::getRoutes())->map(function ($route) {
            return [
                'name' => $route->getName(),
                'uri' => $route->uri(),
                'methods' => $route->methods(),
                'action' => $route->getActionName(),
            ];
        })->filter(function ($route) use ($excludedControllers) {
            if ($route['name'] === null) {
                return false;
            }

            if (Str::contains($route['action'], 'Closure') && !$route['name']) {
                return false;
            }

            foreach ($excludedControllers as $controller) {
                if (Str::startsWith($route['action'], $controller)) {
                    return false;
                }
            }

            return true;
        })
        ->groupBy(function ($route) {
            return explode('.', $route['name'])[0];
        })
        ->reject(function ($group, $key) {
            return in_array($key, ['home', 'storage']);
        })
        ->map(function ($group) {
            return $group->sortBy('name')->values();
        })
        ->toArray();

        return Inertia::render('settings/roles/role-add', [
            'groupedRoutes' => $allRoutes,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'boolean',
        ]);

        $filteredPermissions = collect($validated['permissions'])
            ->filter(fn($value) => $value === true)
            ->keys()
            ->all();

        $role = Role::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'type' => $validated['type'],

        ]);

        $rolePermission = RolePermission::create([
            'role_id' => $role->_id,
            'permissions' => $filteredPermissions,
        ]);

        $role->update([
            'menu_ACL' => (string) $rolePermission->_id,
        ]);

        return redirect()->route('settings.roles.index')->with('success', 'Role created successfully.');
    }

    public function edit(Role $role)
    {
        $permissionDoc = RolePermission::where('role_id', (string)$role->_id)->first();
        $permissionsArray = $permissionDoc ? $permissionDoc->permissions : [];

        $permissions = [];
        foreach ($permissionsArray as $routeName) {
            $permissions[$routeName] = true;
        }

        $excludedControllers = [
        'Laravel\Sanctum\Http\Controllers',
        "App\Http\Controllers\Api\AuthController",
        'App\Http\Controllers\Api\PageController',
        'App\Http\Controllers\Auth\AuthenticatedSessionController'
        ];

        $groupedRoutes = collect(Route::getRoutes())->map(function ($route) {
            return [
                'name' => $route->getName(),
                'uri' => $route->uri(),
                'methods' => $route->methods(),
                'action' => $route->getActionName(),
            ];
        })->filter(function ($route) use ($excludedControllers) {
            if ($route['name'] === null) return false;
            if (Str::contains($route['action'], 'Closure') && !$route['name']) return false;

            foreach ($excludedControllers as $controller) {
                if (Str::startsWith($route['action'], $controller)) return false;
            }

            return true;
        })
        ->groupBy(function ($route) {
            return explode('.', $route['name'])[0];
        })
        ->reject(function ($group, $key) {
            return in_array($key, ['home', 'storage']);
        })
        ->map(function ($group) {
            return $group->sortBy('name')->values();
        })
        ->toArray();

        return Inertia::render('settings/roles/role-edit', [
            'role' => [
                'id' => (string)$role->_id,
                'name' => $role->name,
                'description' => $role->description,
                'type' => $role->type,
            ],
            'groupedRoutes' => $groupedRoutes,
            'permissions' => $permissions,  
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'boolean',
        ]);

        $filteredPermissions = collect($validated['permissions'])
            ->filter(fn($value) => $value === true)
            ->keys()
            ->all();

        $permission = RolePermission::updateOrCreate(
            ['role_id' => (string) $role->_id],
            ['permissions' => $filteredPermissions]
        );

        $role->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'menu_ACL' => (string) $permission->_id,
        ]);

        return redirect()->route('settings.roles.index')->with('success', 'Role updated successfully.');
    }

    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'name' => 'required|string|max:255',
    //         'description' => 'required|string|max:255',
    //         'permissions' => 'required|array',
    //     ]);

    //     $role = Role::create([
    //         'name' => $validated['name'],
    //         'description' => $validated['description'],
    //     ]);


    //     $menuMap = Menu::all()->pluck('name', '_id')->toArray();

    //     $permissionsByName = [];

    //     foreach ($validated['permissions'] as $menuId => $actions) {
    //         $menuName = $menuMap[$menuId] ?? null;

    //         if ($menuName) {
    //             $permissionsByName[$menuName] = [
    //                 'add' => $actions['add'] ?? false,
    //                 'edit' => $actions['edit'] ?? false,
    //                 'view' => $actions['view'] ?? false,
    //                 'delete' => $actions['delete'] ?? false,
    //             ];
    //         }
    //     }


    //     $rolePermission = RolePermission::create([
    //         'role_id' => $role->_id,
    //         'permissions' => $permissionsByName,
    //     ]);


    //     $role->update([
    //         'menu_ACL' => (string) $rolePermission->_id,
    //     ]);

    //     return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    // }

    // public function edit(Role $role)
    // {
    //     $menus = Menu::all(['_id', 'name']);

    //     $permissionDoc = RolePermission::where('role_id', (string)$role->_id)->first();
    //     $permissions = $permissionDoc ? $permissionDoc->permissions : [];

    //     return Inertia::render('settings/roles/role-edit', [
    //         'role' => [
    //             'id' => (string)$role->_id,
    //             'name' => $role->name,
    //             'description' => $role->description,
    //         ],
    //         'permissions' => $permissions,
    //     ]);
    // }

    // public function update(Request $request, Role $role)
    // {

    //     $validated = $request->validate([
    //         'name' => 'required|string|max:255',
    //         'description' => 'required|string',
    //         'permissions' => 'required|array',
    //     ]);


    //     $permission = RolePermission::updateOrCreate(
    //         ['role_id' => (string) $role->_id],
    //         ['permissions' => $validated['permissions']]
    //     );


    //     $role->update([
    //         'name' => $validated['name'],
    //         'description' => $validated['description'],
    //         'menu_ACL' => (string) $permission->_id,
    //     ]);

    //     return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    // }

    public function destroy(Role $role)
    {

        if ($role->menu_ACL) {
            RolePermission::where('_id', $role->menu_ACL)->delete();
        }

        $role->delete();

        return redirect()->route('settings.roles.index')->with('success', 'Role deleted successfully.');
    }
}
