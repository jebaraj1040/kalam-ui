<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Menu;
use Inertia\Inertia;

class MenuController extends Controller
{

    public function index()
    {
        $menus = Menu::all()->map(function ($menu) {
            return [
                'id' => (string) $menu->_id,
                'name' => $menu->name,
                'href' => $menu->href,
                'parent' => $menu->parent,
            ];
        });

        return Inertia::render('settings/menu/menu-view', [
            'menus' => $menus,
        ]);
    }

    public function add()
    {
        return Inertia::render('settings/menu/menu-add');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'href' =>  'required|string|max:255',
            'parent' => 'nullable|string|max:255',
        ]);

        Menu::create([
            'name' => $request->name,
            'href' => $request->href,
            'parent' => $request->parent,
        ]);

        return redirect()->route('menu.index')->with('success', 'menu added successfully.');
    }


    public function edit($id)
    {
        $menu = Menu::findOrFail($id);

        return Inertia::render('settings/menu/menu-edit', [
            'menu' => [
                'id' => (string) $menu->_id,
                'name' => $menu->name,
                'href' => $menu->href,
                'parent' => $menu->parent,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'href' => 'required|string|max:255',
            'parent' => 'nullable|string|max:255',
        ]);

        $menu->update($validated);

        return redirect()->route('menu.index')->with('success', 'Menu updated successfully.');
    }

    public function destroy(Menu $menu)
    {
        $menu->delete();

        return redirect()->route('menu.index')->with('success', 'Menu deleted successfully.');
    }
}
