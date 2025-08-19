<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class DefaultUserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'description' => 'Super Admins can access and manage all features and settings.',
                'type' => 'superadmin'
            ],
            [
                'name' => 'Admin',
                'description' => 'Admins can access and manage some features and settings.',
                'type' => 'admin'
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name']], 
                [
                    'description' => $role['description'],
                    'type' => $role['type'],
                ]
            );
        }
    }

}
