<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Log;
use App\Models\Page;
use App\Models\PageSlug;
use Illuminate\Support\Facades\Redis;

class PageController extends ApiController
{

    /**
     * Show a page by slug and language
     * @param string $slug
     * @param string $lang
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(string $slug, string $lang = 'en')
    {
        Log::info('Inside ' . __METHOD__);

        $getPageSlug = PageSlug::where('slug', $slug)->first();
        if (!$getPageSlug) {
            return $this->respond(404, 'Slug not found');
        }

        $cacheKey = "{$getPageSlug->_id}_{$lang}";
        $getPage = null;

        if (Redis::exists($cacheKey)) {
            $getPage = json_decode(Redis::get($cacheKey), true); // decode as array
            Log::info("Page Data [{$lang}] Fetched from Redis");
        } else {
            $getPage = Page::where([
                'page_slug' => $getPageSlug->_id,
                "status.$lang" => 'Publish'
            ])->select("components", "_id")->first();

            if (!$getPage) {
                return $this->respond(404, 'Page not found');
            }

            $getPage = $getPage->toArray(); // convert object to array            
        }

        $components = $getPage['components']['data'][$lang] ?? null;

        if (!$components) {
            return $this->respond(404, 'Page not found for the specified language');
        }

        Redis::set($cacheKey, json_encode($getPage));

        Log::info("Page Data [{$lang}] Fetched Successfully");

        return $this->respond(200, "Page Data [{$lang}] Fetched Successfully", $components);
    }
}
