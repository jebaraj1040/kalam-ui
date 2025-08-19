<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Tags extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'tags';

    protected $fillable = ['name', 'type'];
}
