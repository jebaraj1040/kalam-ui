<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Menu::firstOrCreate(
            [
                'name' => 'Role',
                'href' => '/settings/role',
                'parent' => null,
            ]
        );
    }
}
