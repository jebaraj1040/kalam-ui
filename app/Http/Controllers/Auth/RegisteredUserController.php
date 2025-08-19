<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\RolePermission;

class RegisteredUserController extends Controller
{

    public function index(): Response
    {

        $permissions = request()->get('permissions', []);
        $roles = Role::all()->keyBy(fn($role) => (string) $role->_id);

        $users = User::all()->map(function ($user) use ($roles) {
            $roleName = $roles[(string) $user->role_id]->name ?? '';

            return [
                'id' => (string) $user->_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $roleName,
            ];
        });

        return Inertia::render('settings/users/user-view', [
            'users' => $users,
            'permissions' => $permissions,
        ]);
    }



    /**
     * Show the registration page.
     */
    // public function create(): Response
    // {
        
    //   $roles = Role::select('_id', 'name')->get()->map(function ($role) {
    //         return [
    //             '_id' => (string) $role->_id, 
    //             'name' => $role->name,
    //         ];
    //     });

    //     return Inertia::render('auth/register', [
    //         'roles' => $roles,
    //     ]); 
    // }

    public function add(): Response
    {
        $roles = Role::select('_id', 'name')->get()->map(function ($role) {
            return [
                '_id' => (string) $role->_id,
                'name' => $role->name,
            ];
        });

        return Inertia::render('settings/users/user-add', [
            'roles' => $roles,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    // public function store(Request $request): RedirectResponse
    // {
    //     $request->validate([
    //         'name' => 'required|string|max:255',
    //         'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
    //         'password' => ['required', 'confirmed', Rules\Password::defaults()],
    //         'role' =>  'required|string',
    //     ]);

    //     $user = User::create([
    //         'name' => $request->name,
    //         'email' => $request->email,
    //         'password' => Hash::make($request->password),
    //         'role_id' => $request->role,
    //     ]);

    //     event(new Registered($user));

    //     Auth::login($user);

    //     return redirect()->intended(route('admin.dashboard', absolute: false));
    // }

    public function userstore(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' =>  'required|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role,
        ]);

        return redirect()->route('settings.users.index')->with('success', 'user created successfully.');
    }

    public function edit(User $user)
    {
        $roles = Role::select('_id', 'name')->get()->map(function ($role) {
            return [
                '_id' => (string) $role->_id,
                'name' => $role->name,
            ];
        });


        return Inertia::render('settings/users/user-edit', [
            'user' => [
                'id' => (string) $user->_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => (string) $user->role_id,
            ],
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role_id' =>  'required|string',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('settings.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('settings.users.index')->with('success', 'user deleted successfully.');
    }
}
