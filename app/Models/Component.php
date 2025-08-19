<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent;
use App\Models\Tags;

class Component extends Eloquent
{
    protected $connection = 'mongodb';

    protected $collection = 'components';

    protected $fillable = [
        'component_name',
        'status',
        'description',
        'tags',
        'schema',
        'user_id',
    ];

    public function getUserDetails()
    {
        return $this->belongsTo(User::class, 'user_id', '_id');
    }
}
