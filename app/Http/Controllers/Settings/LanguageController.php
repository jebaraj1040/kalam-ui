<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LanguageController extends Controller
{
    public array $breadcrumbs;

    /**
     * Constructor to initialize breadcrumbs
     */
    public function __construct()
    {
        $this->breadcrumbs = [
            [
                'title' => 'Dashboard',
                'href' => route('admin.dashboard'),
            ],
            [
                'title' => 'Languange',
                'href' => route('settings.languages.index'),
            ],
        ];
    }

    public function index(Request $request)
    {
        $query = Language::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $languages = $query->where('isActive', 1)->paginate(10)->appends(['search' => $search]);

        return Inertia::render('settings/languages/Index', [
            'languages' => $languages,
            'filters' => ['search' => $search],
            'breadcrumbs' => $this->breadcrumbs,
        ]);
    }

    // public function create()
    // {
    //     return Inertia::render('settings/languages/Create');
    // }

    // public function store(Request $request)
    // {
    //     $data = $request->validate([
    //         'code' => 'required|unique:languages,code',
    //         'name' => 'required',
    //         'native_name' => 'required',
    //     ]);

    //     Language::create($data);
    //     return redirect()->route('settings.languages.index')->with('success', 'Language added');
    // }

    // public function edit(Language $language)
    // {
    //     return Inertia::render('settings/languages/Create', ['language' => $language]);
    // }

    // public function update(Request $request, Language $language)
    // {
    //     $data = $request->validate([
    //         'code' => 'required|unique:languages,code,' . $language->id,
    //         'name' => 'required',
    //         'native_name' => 'required',
    //     ]);

    //     $language->update($data);
    //     return redirect()->route('settings.languages.index')->with('success', 'Language updated');
    // }

    // public function destroy(Language $language)
    // {
    //     $language->delete();
    //     return redirect()->route('settings.languages.index')->with('success', 'Language deleted');
    // }

    /*
    * Set a language as default
     *
     * @param Language $language
     * @return \Illuminate\Http\RedirectResponse
     */
    public function setDefault($id)
    {
        // Unset current default
        Language::where('default', true)->update(['default' => false]);

        // Set new default
        Language::where('id', $id)->update(['default' => true]);

        return redirect()->back()->with('success', 'Default language updated.');
    }

    /**
     * Get all active languages
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getAllLanguages()
    {
        return Language::where('isActive', 1)->get();
    }
}
