<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent;

class ImageTag extends Eloquent
{
    protected $connection = 'mongodb';

    protected $collection = 'media';

    protected $fillable = [
        'tagname',   
    ];
}
