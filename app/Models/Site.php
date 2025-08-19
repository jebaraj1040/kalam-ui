<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use App\Enums\SiteStatus;
use App\Helpers\Utils;

class Site extends Model
{
    protected $connection = 'mongodb';

    protected $fillable = ['name'];
    protected $casts = [
        'status' => SiteStatus::class,
    ];

    protected static function booted()
    {
        static::created(function ($model) {
            $model->site_id = Utils::sanitizeString($model->name);
            $model->timestamps = false;
            $model->saveQuietly();
        });
    }
}
