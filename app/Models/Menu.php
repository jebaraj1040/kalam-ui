<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Menu extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'menus';

    protected $fillable = ['name', 'href', 'parent'];
    
}
