<?php

namespace App\Http\Controllers\Template;

use App\Http\Controllers\Controller;
use App\Models\Component;
use App\Models\Template;
use App\Helpers\Utils;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TemplateController extends Controller
{
    public array $breadcrumbs;

    public $sessionId;

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
                'title' => 'Templates',
                'href' => route('admin.templates.index'),
            ],
        ];
        $this->sessionId = Auth::id();
    }

    /**
     * Show all Templates
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $getAllTemplates = Template::orderBy('created_at', 'desc')->paginate(10);
        return Inertia::render('Templates/Index', [
            'breadcrumbs' => $this->breadcrumbs,
            'templates' => $getAllTemplates,
        ]);
    }

    /**
     * create a new Template view
     * @return \Inertia\Response
     */
    public function create()
    {
        $components = Component::all(['_id', 'component_name'])->where("status", "Active");
        Utils::array_push_custom($this->breadcrumbs, [
            'title' => 'Create Template',
            'href' => route('admin.templates.create'),
        ]);
        return Inertia::render('Templates/Create', [
            'components' => $components,
            'breadcrumbs' => $this->breadcrumbs,
        ]);
    }
    /**
     * Store a new Template
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'templateName' => 'required|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
            'selectedComponents' => 'array',
        ]);

        // Validate unique instance_ids
        $instanceIds = array_column($validated['selectedComponents'], 'instance_id' ?? '');
        if (count($instanceIds) !== count(array_unique($instanceIds))) {
            return back()
                ->withErrors(['duplicate_instance_id' => 'Duplicate instance_id found.'])
                ->withInput();
        }

        $template = Template::create([
            'template_name' => $validated['templateName'],
            'status' => $validated['status'],
            'description' => $validated['description'] ?? '',
            'components' => $validated['selectedComponents'],
            'user_id' => $this->sessionId,
        ]);

        return redirect('/templates')->with('success', 'Template created.');
    }

    /**
     * Edit a single Template
     * @param int $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        $template = Template::findOrFail($id);

        $allComponents = Component::where('status', 'Active')->get();

        $selectedIds = collect($template->components)->pluck('_id')->toArray();

        $availableComponents = $allComponents->filter(function ($component) use ($selectedIds) {
            return !in_array((string) $component->_id, $selectedIds);
        })->values();

        Utils::array_push_custom($this->breadcrumbs, [
            'title' => 'Edit Template',
            'href' => route('admin.templates.edit', $id),
        ]);

        return Inertia::render('Templates/Edit', [
            'template' => $template,
            'availableComponents' => $availableComponents,
            'breadcrumbs' => $this->breadcrumbs,
        ]);
    }

    /**
     * update a Template
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'templateName' => 'required|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
            'selectedComponents' => 'required|array',
            'selectedComponents.*.id' => 'required|string',
            'selectedComponents.*.component_name' => 'required|string',
            'selectedComponents.*.custom_label' => 'nullable|string',
            'selectedComponents.*.instance_id' => 'required|uuid',
        ]);

        // Check for duplicate instance_id
        $instanceIds = collect($validated['selectedComponents'])->pluck('instance_id');

        if ($instanceIds->duplicates()->isNotEmpty()) {
            return back()->withErrors(['selectedComponents' => 'Duplicate instance_id values are not allowed.']);
        }

        $template = Template::findOrFail($id);

        $template->update([
            'template_name' => $validated['templateName'],
            'status' => $validated['status'],
            'description' => $validated['description'] ?? '',
            'components' => $validated['selectedComponents'],
            'user_id' => $this->sessionId,
        ]);

        return redirect()
            ->route('admin.templates.index')
            ->with('success', "Template {$id} updated.");
    }

    /**
     * Delete Template
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $template = Template::find($id)->delete();

        return redirect()->route('admin.templates.index')->with('success', "Template {$id} Deleted.");
    }

    public function importJson(Request $request)
    {
        // dd($request);
        $file = "/home/administrator/Downloads/tmpl_6891d295b3a6dff5f107a3be.json";

        // File validation
        // $request->validate([
        //     'json_file' => 'required|file|mimes:json|max:2048',
        // ]);

        // Parse JSON
        // $jsonContent = file_get_contents($request->file('json_file')->getRealPath());

        $jsonContent = file_get_contents($file);

        $data = json_decode($jsonContent, true);

        if (!is_array($data)) {
            return back()->withErrors(['json_file' => 'Invalid JSON content']);
        }

        $validated = Validator::make($data, [
            'template_name' => 'required|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
            'components' => 'array',
        ])->validate();

        $template = Template::create([
            'template_name' => $validated['template_name'],
            'status' => $validated['status'],
            'description' => $validated['description'] ?? '',
            'components' => $validated['components'],
            'user_id' => $this->sessionId,
        ]);

        return redirect()->route('admin.templates.index')->with('success', "Template {$validated['template_name']} imported.");
    }

    public function exportJson($id)
    {
        $getTemplate = Template::where("_id", $id)->firstOrFail();
        unset($getTemplate["created_at"], $getTemplate["updated_at"], $getTemplate["user_id"], $getTemplate["id"]);
        $jsonData = $getTemplate->toJson(JSON_PRETTY_PRINT);
        return response($jsonData, 200)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="tmpl_' . $id . '.json"');
    }
}
