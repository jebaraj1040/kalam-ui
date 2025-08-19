<?php

namespace App\Http\Controllers\Slug;

use App\Models\PageSlug;

use App\Http\Controllers\Controller;

class SlugController extends Controller
{
    /**
     * Create a new slug
     *
     * @param string $slug
     * @return PageSlug
     */
    public static function createSlug($slug)
    {
        return $slug = PageSlug::create([
            'slug' => $slug
        ]);
    }

    /**
     * Check if a slug is already taken
     *
     * @param string $search
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkSlugIsTaken($search)
    {
        $exists = PageSlug::where("slug", $search)->exists();

        return response()->json([
            'available' => !$exists,
            'message'   => $exists ? "Slug is Already Taken!" : "Slug is Available!",
        ]);
    }
}
