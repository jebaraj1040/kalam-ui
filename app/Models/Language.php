<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent;

class Language extends Eloquent
{
    protected $connection = 'mongodb';

    protected $fillable = ['code', 'name', 'native_name'];

    protected $collection = 'languages';
}
