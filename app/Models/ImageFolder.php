<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent;

class ImageFolder extends Eloquent
{
    protected $connection = 'mongodb';

    protected $collection = 'image_folder';

    protected $fillable = [
        'name',
        'parentfolder',
    ];
    public function media()
    {
        return $this->hasMany(Media::class, 'path_id', 'id');
    }
    public function category()
    {
        return $this->belongsTo(self::class, 'parentfolder');
    }
    public function children()
    {
        return $this->hasMany(self::class, 'parentfolder', 'id');
    }
}
