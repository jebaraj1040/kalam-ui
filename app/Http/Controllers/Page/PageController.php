<?php

namespace App\Http\Controllers\Page;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Slug\SlugController;
use App\Helpers\Utils;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Component;
use App\Models\Template;
use App\Models\Page;
use App\Models\PageRevision;
use SimpleXMLElement;
use App\Http\Controllers\Settings\LanguageController;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Auth;

class PageController extends Controller
{
    public array $breadcrumbs;

    public $getAllLanguages;

    public $sessionId;

    /**
     * Constructor to initialize breadcrumbs and languages
     */
    public function __construct()
    {
        $this->breadcrumbs = [
            [
                'title' => 'Dashboard',
                'href' => route('admin.dashboard'),
            ],
            [
                'title' => 'Pages',
                'href' => route('admin.pages.index'),
            ],
        ];
        $this->getAllLanguages = LanguageController::getAllLanguages(); // Ensure languages are loaded
        $this->sessionId = Auth::id();
    }
    /**
     * Show all Pages
     */
    public function index()
    {
        $getAllPages = Page::with('template')->orderBy('created_at', 'desc')->paginate(10);
        return Inertia::render('Pages/Index', [
            'breadcrumbs' => $this->breadcrumbs,
            'pages' => $getAllPages,
        ]);
    }

    /**
     * create a new Page view
     */
    public function create()
    {
        $templates = Template::all()->map(function ($tpl) {
            $tpl->id = (string) $tpl->_id;

            // Work on a separate array
            $components = $tpl->components ?? [];

            if (is_array($components)) {
                foreach ($components as &$comp) {
                    if (isset($comp['id'])) {
                        $comp['id'] = (string) $comp['id'];
                    }
                }
            }

            // Assign it back!
            $tpl->setAttribute('components', $components);

            return $tpl;
        });
        Utils::array_push_custom($this->breadcrumbs, [
            'title' => 'Create Page',
            'href' => route('admin.pages.create'),
        ]);
        return Inertia::render('Pages/Create', [
            'breadcrumbs' => $this->breadcrumbs,
            'templates' => $templates,
            'languages' => $this->getAllLanguages,
        ]);
    }

    /**
     * Store a new Page
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pageName' => 'required|string|max:255',
            'pageSlug' => 'required|string|max:255',
            'status' => 'required',
            'description' => 'nullable|string',
            'template_id' => 'required|exists:templates,id',
            'components' => 'required', // JSON string (API format)
            'raw_components' => 'required',  // JSON string (edit page format)
        ]);

        $slug = SlugController::createSlug($validated['pageSlug']);

        $page = Page::create([
            'page_name' => $validated['pageName'],
            'page_slug' => $slug->id,
            'status' => $validated['status'],
            'description' => $validated['description'] ?? null,
            'template_id' => $validated['template_id'],
            'components' => $validated['components'] ?? [], // store as array (cast to JSON)
            'raw_components' => $validated['raw_components'] ?? [],
            'user_id' => $this->sessionId,
        ]);

        return redirect()->route('admin.pages.index')->with('success', 'Page created successfully.');
    }

    /**
     * Edit a Page
     */
    public function edit($id)
    {
        $page = Page::findOrFail($id);
        $template = Template::findOrFail($page->template_id);
        Utils::array_push_custom($this->breadcrumbs, [
            'title' => 'Edit Page',
            'href' => route('admin.pages.edit', $id),
        ]);
        return Inertia::render('Pages/Edit', [
            'page' => $page,
            'breadcrumbs' => $this->breadcrumbs,
            'templates' => [$template],
            'selectedComponents' => $page->components ?? [],
            'rawComponents' => $page->raw_components ?? [],
            'languages' => $this->getAllLanguages,
        ]);
    }

    /**
     * Update a Page
     */
    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);

        $this->revisionAddCall($page);

        $this->redisConfigCall($page, $request->status);

        // Apply new update from form
        $page->update([
            'pageName' => $request->pageName,
            'pageSlug' => $request->pageSlug,
            'description' => $request->description,
            'status' => $request->status,
            'template_id' => $request->template_id,
            'components' => $request->components ?? [],
            'raw_components' => $request->raw_components ?? [],
            'user_id' => $this->sessionId,
        ]);

        return redirect()->route('admin.pages.index')->with('success', "Page {$id} updated successfully.");
    }
    /**
     * Delete a Page
     */
    public function destroy($id)
    {
        $template = Page::find($id)->delete();

        return redirect()->route('admin.pages.index')->with('success', "Page {$id} Deleted.");
    }


    /**
     * Fetch a template related components
     */
    public function fetchTemplateComponents($templateId)
    {
        $template = Template::find($templateId);

        if (!$template) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        if (empty($template->components)) {
            return response()->json([]);
        }
        $components = collect($template->components)->map(function ($c) {
            // Fetch _id from the array
            $componentId = Arr::get($c, 'id');
            if (!$componentId) {
                return null;
            }

            $componentModel = Component::find($componentId);

            if ($componentModel) {
                return [
                    'id' => (string)$componentModel->_id,
                    'component_name' => $componentModel->component_name,
                    'custom_label' => $c["custom_label"] ?? "",
                    'schema' => $componentModel->schema,
                ];
            }

            return null;
        })->filter();

        return response()->json($components->values());
    }

    public function revisionAddCall(Page $page)
    {
        $previousRevision = $page->revisions()->latest()->first();

        $currentData = [
            'template_id' => $page->template_id,
            'components' => $page->components,
            'raw_components' => $page->raw_components,
            'page_name' => $page->page_name,
            'page_slug' => $page->page_slug,
            'status' => $page->status,
            'description' => $page->description,
        ];

        // Diff generator — you can customize this function (see below)
        $changes = $previousRevision ? $this->getChangesBetweenRevisions($previousRevision->data, $currentData) : ['Initial version'];

        // Save current page state as a revision BEFORE update
        PageRevision::create([
            'page_id' => $page->_id,
            'revision_number' => ($page->revisions()->count() + 1),
            'data' => $currentData,
            'changes' => $changes,
            'user_id' => $this->sessionId,
        ]);
    }

    /**
     * Redis configuration call
     * @param Page $page
     * @param array $status
     * @return void
     */
    public function redisConfigCall(Page $page, $status)
    {
        foreach ($page->status as $lang => $stat) {
            foreach ($status as $key => $value) {
                if ($stat === 'Publish' && $value === 'Publish') {
                    $this->redisLangClear($page->page_slug, $lang);
                } else if ($stat === 'Draft' && $value === 'Publish') {
                    $this->redisLangClear($page->page_slug, $lang);
                }
            }
        }
    }

    /**
     * Clear Redis cache for a specific page and language
     *
     * @param int $pageId
     * @param string $lang
     * @return void
     */
    public function redisLangClear($pageSlugId, $lang)
    {
        $cacheKey = "{$pageSlugId}_{$lang}";
        if (Redis::exists($cacheKey)) {
            Redis::del($cacheKey);
        } else {
            \Log::info("No Redis cache found for page {$pageSlugId} in language {$lang}");
        }
    }

    /**
     * Revision view page
     */
    public function revisions($pageId)
    {
        $page = Page::findOrFail($pageId);

        $revisions = $page->revisions()
            ->orderBy('revision_number', 'desc')
            ->get();

        return Inertia::render('Pages/Revisions', [
            'page' => $page,
            'revisions' => $revisions,
            'breadcrumbs' => $this->breadcrumbs,
        ]);
    }

    /**
     * Get changes between two revisions
     *
     * @param array $old
     * @param array $new
     * @return array
     */
    private function getChangesBetweenRevisions(array $old, array $new): array
    {
        $changes = [];

        // Compare top-level fields
        foreach ($new as $key => $newVal) {
            if (!array_key_exists($key, $old)) {
                $changes[] = "Field '{$key}' added.";
                continue;
            }

            if ($newVal !== $old[$key]) {
                if (in_array($key, ['components', 'raw_components'])) {
                    $changes[] = "Components updated.";
                } else {
                    $changes[] = "Field '{$key}' changed.";
                }
            }
        }

        return $changes;
    }

    /**
     * Revert particular revisison
     */
    public function revertRevision($pageId, $revisionId)
    {
        $page = Page::findOrFail($pageId);

        $revision = PageRevision::where('page_id', $pageId)->findOrFail($revisionId);

        $page->update([
            'page_name' => $revision->data['page_name'] ?? $page->page_name,
            'page_slug' => $revision->data['page_slug'] ?? $page->page_slug,
            'status' => $revision->data['status'] ?? $page->status,
            'description' => $revision->data['description'] ?? $page->description,
            'template_id' => $revision->data['template_id'],
            'components' => $revision->data['components'] ?? [],
            'raw_components' => $revision->data['raw_components'] ?? [],
            'user_id' => $this->sessionId,
        ]);

        return redirect()->route('admin.pages.index')->with('success', "Page reverted to revision #{$revision->revision_number}.");
    }

    /**
     * Export page data as XML
     */
    public function exportXML($id)
    {
        $page = Page::with('getSlugVal')->findOrFail($id);

        // Decode JSON strings
        $components = json_decode(json_encode($page->components), true);

        $xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><page></page>');

        $xml->addChild('page_name', htmlspecialchars($page->page_name));
        $xml->addChild('page_slug', $page->getSlugVal->slug);
        $xml->addChild('description', htmlspecialchars($page->description));

        $componentsNode = $xml->addChild('components');

        foreach ($components as $lang => $componentsArray) {
            $langNode = $componentsNode->addChild('language');
            $langNode->addAttribute('code', $lang);

            foreach ($componentsArray as $component) {
                $compNode = $langNode->addChild('component');
                $compNode->addAttribute('name', $component['component_name']);
                $compNode->addAttribute('label', $component['custom_label']);

                $data = $component['data'] ?? [];

                foreach ($data as $blockKey => $blockData) {
                    foreach ($blockData as $blockItems) {
                        $blockNode = $compNode->addChild('block');
                        $blockNode->addAttribute('name', $blockKey);

                        $this->appendRecursiveXml($blockNode, $blockItems);
                    }
                }
            }
        }

        $xmlContent = $xml->asXML();

        return response($xmlContent, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Content-Disposition', 'attachment; filename="page-' . $page->id . '.xml"');
    }

    /**
     * Append data to XML recursively
     *
     * @param SimpleXMLElement $xmlNode
     * @param mixed $data
     */
    private function appendRecursiveXml(SimpleXMLElement $xmlNode, $data)
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                // Problem: numeric keys become <0>, <1>, which are invalid XML tags
                $childNode = is_numeric($key)
                    ? $xmlNode->addChild('item') // use 'item' instead of numeric
                    : $xmlNode->addChild($key);

                $this->appendRecursiveXml($childNode, $value);
            } else {
                $xmlNode->addChild($key, htmlspecialchars((string) $value));
            }
        }
    }
}
