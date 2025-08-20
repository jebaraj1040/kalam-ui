<?php

namespace App\Http\Controllers\Folder;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\ImageFolder;
use Illuminate\Support\Facades\Storage;
use Exception;
use Illuminate\Support\Facades\Redirect;

class FolderController extends Controller
{
    public array $breadcrumbs;
    public function __construct()
    {
        $this->breadcrumbs = [
            [
                'title' => 'Dashboard',
                'href' => route('admin.dashboard'),
            ],
            [
                'title' => 'Folder',
                'href' => route('admin.folder.index'),
            ],
        ];
    }

    public function index(Request $request)
    {
        $folders = ImageFolder::all();
        return Inertia::render('Folder/Index', [
            'breadcrumbs' => $this->breadcrumbs,
            'folders' => $folders,
        ]);
    }
    public function fetchFolderList()
    {
        $folders = ImageFolder::whereNull('parentfolder')->with('media')->orderBy('id', 'desc')->get();
        $folderList = [];
        if (!empty(count($folders))) {
            foreach ($folders as $key => $folder) {
                $folderList[$key] = [
                    'title' => $folder->name,
                    'fileCount' => $folder->media->count()
                ];
            }
        }
        $data['folders'] = $folderList;
        $data['breadcrumbs'] = $this->breadcrumbs;
        return response()->json(['success' => true, 'folderList' => $data]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'folderName' => 'required|string',
            ]);
            // $request->validate([
            //     'folder_path' => 'required|string',
            // ]);
            $disk = env('IS_UPLOAD_CDN') ? 'cdn_disk' : 'custom_uploads';
            $parentId = $request->parent_folder_id;
            $folderPath = trim($request->folderName, '/');
            // $folderPath = trim($request->folder_path, '/');
            if (!empty($parentId)) {
                $parent = ImageFolder::find($parentId);
                if (!$parent) {
                    return response()->json(['success' => false, 'message' => 'Parent folder not found']);
                }
                $folderPath = trim($parent->name, '/') . '/' . $folderPath;
            }
            // Check if folder exists in the disk
            if (!Storage::disk($disk)->exists($folderPath)) {
                Log::info("Using disk: $disk");
                Log::info("Disk root: " . config("filesystems.disks.$disk.root"));
                Log::info("Creating folder: $folderPath");

                Storage::disk($disk)->makeDirectory($folderPath);

                $fullPath = Storage::disk($disk)->path($folderPath);
                Log::info("Absolute full path: " . $fullPath);

                ImageFolder::create([
                    'name' => $folderPath,
                    'parentfolder' => $parentId,
                    'childfolder' => "",
                ]);

                return response()->json(['success' => true, 'message' => 'Folder created successfully']);
            } else {
                return response()->json(['success' => false, 'message' => 'Folder already exists']);
            }
        } catch (Exception $e) {
            Log::error($e);
            return response()->json(['success' => false, 'message' => 'Something went wrong']);
        }
    }
}
