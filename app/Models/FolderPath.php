<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent;

class FolderPath extends Eloquent
{
    protected $connection = 'mongodb';

    protected $collection = 'folder_paths';

    protected $fillable = [
        'path',  
    ];
}
