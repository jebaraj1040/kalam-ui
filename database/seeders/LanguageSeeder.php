<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Language;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'default' => true, 'isActive' => 1],
            ['code' => 'ta', 'name' => 'Tamil', 'native_name' => 'தமிழ்', 'default' => false, 'isActive' => 1],
            ['code' => 'hi', 'name' => 'Hindi', 'native_name' => 'हिन्दी', 'default' => false, 'isActive' => 1],
            ['code' => 'bn', 'name' => 'Bengali', 'native_name' => 'বাংলা', 'default' => false, 'isActive' => 1],
            ['code' => 'pa', 'name' => 'Punjabi', 'native_name' => 'ਪੰਜਾਬੀ', 'default' => false, 'isActive' => 1],
            ['code' => 'gu', 'name' => 'Gujarati', 'native_name' => 'ગુજરાતી', 'default' => false, 'isActive' => 1],
            ['code' => 'ur', 'name' => 'Urdu', 'native_name' => 'اردو', 'default' => false, 'isActive' => 1],
            ['code' => 'ml', 'name' => 'Malayalam', 'native_name' => 'മലയാളം', 'default' => false, 'isActive' => 1],
            ['code' => 'te', 'name' => 'Telugu', 'native_name' => 'తెలుగు', 'default' => false, 'isActive' => 1],
            // ['code' => 'ar', 'name' => 'Arabic', 'native_name' => 'العربية', 'default' => false, 'isActive' => 1],
            // ['code' => 'zh', 'name' => 'Chinese', 'native_name' => '中文', 'default' => false, 'isActive' => 1],
            // ['code' => 'fr', 'name' => 'French', 'native_name' => 'Français','status'=>'InActive','isActive' => 1],
            // ['code' => 'es', 'name' => 'Spanish', 'native_name' => 'Español','status'=>'InActive','isActive' => 1],
            // ['code' => 'ru', 'name' => 'Russian', 'native_name' => 'Русский','status'=>'InActive','isActive' => 1],
            // ['code' => 'de', 'name' => 'German', 'native_name' => 'Deutsch','status'=>'InActive','isActive' => 1],
            // ['code' => 'ja', 'name' => 'Japanese', 'native_name' => '日本語','status'=>'InActive','isActive' => 1],
            // ['code' => 'pt', 'name' => 'Portuguese', 'native_name' => 'Português','status'=>'InActive','isActive' => 1],
            // ['code' => 'tr', 'name' => 'Turkish', 'native_name' => 'Türkçe','status'=>'InActive','isActive' => 1],
            // ['code' => 'it', 'name' => 'Italian', 'native_name' => 'Italiano','status'=>'InActive','isActive' => 1],
            // ['code' => 'ko', 'name' => 'Korean', 'native_name' => '한국어','status'=>'InActive','isActive' => 1],
            // ['code' => 'vi', 'name' => 'Vietnamese', 'native_name' => 'Tiếng Việt','status'=>'InActive','isActive' => 1],
            // ['code' => 'fa', 'name' => 'Persian', 'native_name' => 'فارسی','status'=>'InActive','isActive' => 1],
            // ['code' => 'id', 'name' => 'Indonesian', 'native_name' => 'Bahasa Indonesia','status'=>'InActive','isActive' => 1],
            // ['code' => 'th', 'name' => 'Thai', 'native_name' => 'ไทย','status'=>'InActive','isActive' => 1],
            // ['code' => 'pl', 'name' => 'Polish', 'native_name' => 'Polski','status'=>'InActive','isActive' => 1],
            // ['code' => 'uk', 'name' => 'Ukrainian', 'native_name' => 'Українська','status'=>'InActive','isActive' => 1],
        ];

        Language::insert($languages);
    }
}
