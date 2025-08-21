<?php

namespace App\Http\Controllers\Media;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Media;
use App\Models\ImageTag;
use Illuminate\Support\Facades\Log;
use App\Models\ImageFolder;
use Exception;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
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
                'title' => 'Media',
                'href' => route('admin.media.index'),
            ],
        ];
    }
    public function index(Request $request)
    {
        if ($request) {
            log::info($request->input('searchString'));
            $searchString = $request->input('searchString');
            $matchingTags = ImageTag::where('tagname', 'like', '%' . $searchString . '%')->get();
            $matchingTagIds = $matchingTags->pluck('id');
        }
        $folders = ImageFolder::all()->keyBy('id');
        $imageTags = ImageTag::all()->keyBy('id');

        $media = Media::latest()->paginate(10);

        $media->getCollection()->transform(function ($item) use ($folders, $imageTags) {
            $folder = $folders->get($item->path_id);
            $tagNames = collect($item->tags)->map(fn($id) => $imageTags->get($id)?->tagname)->filter()->implode(', ');
            $item->folder = $folder ? $folder->toArray() : null;
            $item->tagNames = $tagNames;
            return $item;
        });

        return Inertia::render('Media/Index', [
            'breadcrumbs' => $this->breadcrumbs,
            'mediaItems' => $media,
            'folders' => $folders->values(),
            'imageTags' => $imageTags->values(),
        ]);
    }
    public function store(Request $request)
    {
        try {
            $allowedExtensions = ['png', 'svg', 'webp', 'woff2', 'csv', 'pdf'];
            $rejectedFiles = [];
            $folderPathId = $request->folderPathId;
            $mediaFiles = $request->file('files');
            $mediaTags = $request->filesTags;
            $isExistFolder = ImageFolder::find($folderPathId);
            if (!$isExistFolder) {
                return response()->json(['error' => 'Invalid folder path ID'], 404);
            }
            $relativePath = trim($isExistFolder->name, '/');
            $disk = env('IS_UPLOAD_CDN') ? 'cdn_disk' : 'custom_uploads';
            $mediaData = [];
            if (!empty($mediaFiles)) {
                foreach ($mediaFiles as $key => $file) {
                    $extension = strtolower($file->getClientOriginalExtension());
                    if (!in_array($extension, $allowedExtensions)) {
                        $rejectedFiles[] = $file->getClientOriginalName();
                        continue;
                    }
                    $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                    $random = Str::random(10);
                    $fileName = "{$originalName}_{$random}.{$extension}";
                    $fileTagIds = $this->fetchFileBaseTagId(json_decode($mediaTags[$key], true));
                    Storage::disk($disk)->putFileAs($relativePath, $file, $fileName);
                    Media::create([
                        'name'    => $fileName,
                        'path_id' => $folderPathId,
                        'tags' => $fileTagIds,
                    ]);
                }
            }
            return response()->json(['success' => true, 'message' => 'asset added successful']);
        } catch (\Exception $e) {
            Log::error("Upload error: " . $e->getMessage());
            return response()->json(['error' => 'File upload failed'], 500);
        }
    }
    public function fetchFileBaseTagId($tags = [])
    {
        if (!empty($tags)) {
            foreach ($tags as $key => $tageValue) {
                $value = $tageValue['value'];
                $updateMediaTag = ImageTag::find($value);
                $mediaTagId = '';
                if ($updateMediaTag) {
                    $mediaTagId = (string) $updateMediaTag->_id;
                } else {
                    $updateMediaTag = ImageTag::create([
                        'tagname' => $value
                    ]);
                    $mediaTagId = (string) $updateMediaTag->_id;
                }
                $tagIds[] = $mediaTagId;
            }
        }
        return $tagIds;
    }
    // public function store(Request $request)
    // {
    //     try {
    //         Log::info($request);

    //         $files = $request->file('file');
    //         $allowedExtensions = ['png', 'svg', 'webp', 'woff2', 'csv', 'pdf'];
    //         $rejectedFiles = [];

    //         $folderPathId = $request->input('folder_path_id');
    //         $folderData = ImageFolder::find($folderPathId);
    //         $finalTagIds = $this->resolveFinalImageTagIds(
    //             $request->input('image_tags', '[]'),
    //             $request->input('New_image_tags', '[]')
    //         );

    //         Log::info($folderData);

    //         if (!$folderData) {
    //             return response()->json(['error' => 'Invalid folder path ID'], 404);
    //         }

    //         $relativePath = trim($folderData->name, '/');

    //         $disk = env('IS_UPLOAD_CDN') ? 'cdn_disk' : 'custom_uploads';

    //         if (!is_array($files)) {
    //             $files = [$files];
    //         }

    //         foreach ($files as $file) {
    //             $extension = strtolower($file->getClientOriginalExtension());

    //             if (!in_array($extension, $allowedExtensions)) {
    //                 $rejectedFiles[] = $file->getClientOriginalName();
    //                 continue;
    //             }

    //             $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
    //             $random = Str::random(10);
    //             $fileName = "{$originalName}_{$random}.{$extension}";

    //             Storage::disk($disk)->putFileAs($relativePath, $file, $fileName);

    //             Media::create([
    //                 'name'    => $fileName,
    //                 'path_id' => $folderPathId,
    //                 'tags' => $finalTagIds,
    //             ]);
    //         }

    //         return response()->json(['success' => true, 'message' => 'asset added successful']);
    //     } catch (\Exception $e) {
    //         Log::error("Upload error: " . $e->getMessage());
    //         return response()->json(['error' => 'File upload failed'], 500);
    //     }
    // }
    private function resolveFinalImageTagIds(string $imageTagsJson, string $newImageTagsJson): array
    {
        $imageTags = json_decode($imageTagsJson, true) ?? [];
        $newImageTags = json_decode($newImageTagsJson, true) ?? [];
        $imageTags = array_filter($imageTags, function ($tag) use ($newImageTags) {
            return !in_array($tag, $newImageTags);
        });
        Log::info($imageTags);
        Log::info($newImageTags);
        $createdTags = [];
        foreach ($newImageTags as $tagName) {
            $newTag = ImageTag::create(['tagname' => $tagName]);
            $createdTags[] = (string) $newTag->_id;
        }

        return array_unique(array_merge($imageTags, $createdTags));
    }

    public function destroy($id)
    {
        $media = Media::find($id)->delete();

        return response()->json(['success' => true, 'message' => 'asset deleted successfully']);
    }

    public function edit($id)
    {
        $media = Media::findOrFail($id);
        $folders = ImageFolder::all()->keyBy('id');
        $imageTags = ImageTag::all()->keyBy('id');
        Log::info($media);
        return Inertia::render('Media/editmedia', [
            'media' => $media,
            'folders' => $folders,
            'imageTags' => $imageTags,
        ]);
    }
    public function update(Request $request, $id)
    {
        Log::info('Update Request Data:', [
            'id' => $id,
            'data' => $request->all(),
        ]);
        $name = $request->input('name');
        $media = Media::findOrFail($id);

        $existingPathId = $media->path_id;
        $incomingPathId = $request->input('path_id');

        $cdnPath = env('CDN_FILE_PATH');
        $fileName = $media->name;

        $oldFolderName = optional(ImageFolder::find($media->path_id))->name;
        $newFolderName = optional(ImageFolder::find($incomingPathId))->name;

        if ($oldFolderName && $newFolderName) {
            $oldPath = $cdnPath . '/' . $oldFolderName . '/' . $fileName;
            $newPath = $cdnPath . '/' . $newFolderName . '/' . $fileName;

            if (!file_exists(dirname($newPath))) {
                mkdir(dirname($newPath), 0775, true);
            }

            if (file_exists($oldPath)) {
                if (rename($oldPath, $newPath)) {
                    Log::info("Moved: {$fileName} from {$oldFolderName} to {$newFolderName}");

                    $media->path_id = $incomingPathId;
                    $media->save();

                    Log::info("Updated media path_id to {$incomingPathId}");
                } else {
                    Log::error("Failed to move file: {$fileName}");
                }
            } else {
                Log::warning("Old file not found at: {$oldPath}");
            }
        } else {
            Log::error("Folder names could not be resolved.");
        }


        $existingTags = $media->tags ?? [];
        $incomingTagValues = $request->input('image_tags', []);

        $tagsToKeep = array_intersect($existingTags, $incomingTagValues);

        $tagsToAdd = array_diff($incomingTagValues, $existingTags);

        foreach ($tagsToAdd as $tagValue) {
            $tag = ImageTag::find($tagValue);

            if ($tag) {
                $tagsToKeep[] = (string) $tag->_id;
            } else {
                $newTag = ImageTag::create(['tagname' => $tagValue]);
                $tagsToKeep[] = (string) $newTag->_id;
            }
        }

        $tagsToKeep = array_unique($tagsToKeep);
        $media->tags = array_values($tagsToKeep);

        $media->save();

        Log::info('Updated Tags on Media:', $media->tags);

        return response()->json(['message' => 'Media updated successfully.']);
    }
}
