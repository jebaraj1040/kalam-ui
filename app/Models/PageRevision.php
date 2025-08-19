<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class PageRevision extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'page_revisions';

    protected $fillable = [
        'page_id',
        'data',
        'changes',
        'revision_number',
        'user_id',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
