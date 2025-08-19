<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class PageSlug extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'pages_slug';

    protected $fillable = ['slug'];
}
