<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;

class Utils
{
    public static function sanitizeString($string)
    {
        $string = preg_replace('/[^A-Za-z0-9 ]/', '', $string);
        $string = preg_replace('/\s+/', '-', $string);
        $string = strtolower($string);
        return trim($string, '-');
    }

    public static function array_push_custom(array &$array, $value): array
    {
        $array[] = $value;
        return $array;
    }
    public static function formatBytes($size, $precision = 2)
    {
        if ($size > 0) {
            $size = (int) $size;
            $base = log($size) / log(1024);
            $suffixes = array(' bytes', ' KB', ' MB', ' GB', ' TB');

            return round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];
        } else {
            return $size;
        }
    }
    public static function getFileDimension(UploadedFile $file): array
    {
        $size = getimagesize($file->getRealPath());
        return [
            'width'     => $size[0] ?? 0,
            'height'    => $size[1] ?? 0,
        ];
    }
}
