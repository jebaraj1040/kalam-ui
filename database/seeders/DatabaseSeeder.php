<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(DefaultUserRoleSeeder::class);

        $superAdminRole = Role::where('name', 'Super Admin')->first();

        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@novac.com',
            'password' => Hash::make('Welcome@abc'),
            'role_id' => $superAdminRole->_id, 
        ]);
    }
}

