<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Template extends Eloquent
{
    protected $connection = 'mongodb';

    protected $collection = 'templates';

    protected $fillable = [
        'template_name',
        'status',
        'description',
        'components',
        'user_id',
    ];

    public function getUserDetails()
    {
        return $this->belongsTo(User::class, 'user_id', '_id');
    }
}
