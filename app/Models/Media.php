<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent;

class Media extends Eloquent
{
    protected $connection = 'mongodb';

    protected $collection = 'media';

    protected $fillable = [
        'name',      
        'path_id',
        'tags'   
    ];
}
