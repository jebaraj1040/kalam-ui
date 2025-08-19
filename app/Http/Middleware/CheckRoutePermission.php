<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Support\Facades\Log;

class CheckRoutePermission
{
    public function handle(Request $request, Closure $next)
    {
        $routeName = $request->route()->getName();

        if (!Auth::check()) {
            Log::warning('No user logged in for route: ' . $routeName);
            abort(403, 'Unauthorized: no user logged in');
        }

        $user = Auth::user();

        $role = Role::find($user->role_id);
        if (!$role) {
            abort(403, 'Unauthorized: no role assigned');
        }

        if (strtolower($role->type) === 'superadmin') {
            $request->attributes->set('permissions', 'all');
            return $next($request);
        }

        $rolePermission = $role->menu_ACL ? RolePermission::find($role->menu_ACL) : null;
        $permissions = $rolePermission ? $rolePermission->permissions : [];

        Log::info('Checking route permission for route:', ['route' => $routeName]);
        Log::info('User permissions:', ['permissions' => $permissions]);

        if (!in_array($routeName, $permissions)) {
            Log::warning('Permission denied for route: ' . $routeName, ['permissions' => $permissions]);
            abort(403, 'Unauthorized: permission denied');
        }

        // Filter permissions to only those matching the current route's "base"
        $baseRoute = $this->getBaseRoute($routeName);
        $filteredPermissions = array_filter($permissions, function ($perm) use ($baseRoute) {
            return str_starts_with($perm, $baseRoute);
        });

        $request->attributes->set('permissions', $filteredPermissions);
        return $next($request);
    }

    protected function getBaseRoute(string $routeName): string
    {
        $parts = explode('.', $routeName);
        array_pop($parts);
        return implode('.', $parts) . '.';
    }
}
