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
}
