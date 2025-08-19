<?php

namespace App\Helpers;

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
}
