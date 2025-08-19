<?php

namespace App\Http\Controllers\Component;

use App\Http\Controllers\Controller;
use App\Models\Component;
use App\Models\Tags;
use App\Helpers\Utils;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ComponentController extends Controller
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
                'title' => 'Components',
                'href' => route('admin.components.index'),
            ],
        ];
        $this->sessionId = Auth::id();
    }

    /**
     * Show all components
     * @return \Inertia\Response
     */
    public function index()
    {
        $getAllComponents = Component::with("getUserDetails")->orderBy('created_at', 'desc')->get();
        // foreach($getAllComponents as $component){
        //     print_r($component->getUserDetails->name);exit;
        // }
        $getAllComponentsByPage = Component::with("getUserDetails")->orderBy('created_at', 'desc')->paginate(10);
        // exit;
        return Inertia::render('Components/Index', [
            'components' => $getAllComponentsByPage,
            'breadcrumbs' => $this->breadcrumbs,
            'permissions' => $permissions,
        ]);
    }

    /**
     * create a new component view
     * @param Request $request
     * @return \Inertia\Response
     */
    public function create(Request $request)
    {
        $getCount = $this->getComponentsCount();

        $getAllTags = Tags::where('type', 'component')->get();

        // Add a breadcrumb for the create component page
        Utils::array_push_custom($this->breadcrumbs, [
            'title' => 'Create Component',
            'href' => route('admin.components.create'),
        ]);

        // Render the create component page with the component count,breadcrumbs, and tags
        return Inertia::render('Components/Create', [
            'component_count' => $getCount,
            'breadcrumbs' => $this->breadcrumbs,
            'tags' => $getAllTags,
        ]);
    }

    /**
     * Store a new component
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'componentName' => 'required|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
            'tags' => 'nullable|json',
            'schema' => 'nullable|json',
            'tag_ids' => 'nullable|array',
        ]);

        $getTagRes = array_merge($this->CreateTags(json_decode($validated['tags']) ?? []), $validated["tag_ids"]);

        $component = Component::create([
            'component_name' => $validated['componentName'],
            'status' => $validated['status'],
            'description' => $validated['description'] ?? '',
            'tags' => $getTagRes ?? [],
            'schema' => json_decode($validated['schema'], true) ?? [],
            'user_id' => $this->sessionId,
        ]);

        return redirect()->route('admin.components.index')->with('success', 'Component created.');
    }

    /**
     * Edit a single component
     * @param int $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        $component = Component::findOrFail($id);
        $getAllTags = Tags::where('type', 'component')->get();
        $getCompTags = Tags::whereIn("_id", $component->tags)->get();
        $getCount = $this->getComponentsCount();
        Utils::array_push_custom($this->breadcrumbs, [
            'title' => 'Edit Component',
            'href' => route('admin.components.edit', $id),
        ]);
        return Inertia::render('Components/Edit', [
            'component' => $component,
            'breadcrumbs' => $this->breadcrumbs,
            'component_count' => $getCount,
            'all_tags' => $getAllTags,
            'tags' => $getCompTags,
        ]);
    }

    /**
     * update a component
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'componentName' => 'required|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
            'tags' => 'nullable|json',
            'schema' => 'nullable|json',
            'tag_ids' => 'nullable|array',
        ]);

        $component = Component::findOrFail($id);

        $getTagRes = array_merge($this->CreateTags(json_decode($validated['tags']) ?? []), $validated["tag_ids"]);

        $component->update([
            'component_name' => $validated['componentName'],
            'status' => $validated['status'],
            'description' => $validated['description'] ?? '',
            'tags' => $getTagRes ?? [],
            'schema' => json_decode($validated['schema'], true) ?? [],
            'user_id' => $this->sessionId,
        ]);

        return redirect()
            ->route('admin.components.index')
            ->with('success', 'Component updated.');
    }

    /**
     * Delete a component
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $component = Component::find($id)->delete();

        return redirect()->route('admin.components.index')->with('success', "Component {$id} deleted.");;
    }

    /**
     * Create tags if they do not exist
     * @param array $tags
     * @return void
     */
    private function CreateTags(array $tags)
    {
        $tagsPush = [];

        foreach ($tags as $tag) {
            if (!Tags::where('name', $tag->name)->exists()) {
                $tagsCreate = Tags::create([
                    'name' => $tag->name,
                    'type' => $tag->type,
                ]);
                $tagsPush[] = $tagsCreate->id;
            }
        }

        return $tagsPush;
    }

    /**
     * Return all active components as JSON
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getActiveComponents(Request $request)
    {
        $query = Component::query()->where('status', 'Active');

        if ($search = $request->input('search')) {
            $query->where('component_name', 'like', '%' . $search . '%');
        }

        // if req came from edit page
        if ($cid = $request->input('cid')) {
            $query->where('_id', '!=', $cid);
        }

        $components = $query->get();

        return response()->json($components);
    }

    /**
     * Return all active components count
     * @return int
     */
    private static function getComponentsCount()
    {
        return Component::count();
    }

    public function importJson(Request $request)
    {
        // dd($request);
        $file = "/home/administrator/Downloads/component_6892ff1ef80f12e67d0cad7d.json";

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
            'component_name' => 'required|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'schema' => 'nullable|json',
        ])->validate();

        $component = Component::create([
            'component_name' => $validated['component_name'],
            'status' => $validated['status'],
            'description' => $validated['description'] ?? '',
            'tags' => $validated['tags'] ?? [],
            'schema' => json_decode($validated['schema'], true) ?? [],
            'user_id' => $this->sessionId,
        ]);

        return redirect()->route('admin.components.index')->with('success', 'Component imported.');
    }

    public function exportJson($id)
    {
        $getComponent = Component::where("_id", $id)->firstOrFail();
        $getComponent["schema"] = json_encode($getComponent["schema"]);
        unset($getComponent["created_at"], $getComponent["updated_at"], $getComponent["user_id"], $getComponent["id"]);
        $jsonData = $getComponent->toJson(JSON_PRETTY_PRINT);
        return response($jsonData, 200)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="component_' . $id . '.json"');
    }
}
