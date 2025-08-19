<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent;

class Page extends Eloquent
{
    protected $connection = 'mongodb';

    protected $collection = 'pages';

    protected $fillable = ['page_name', 'page_slug', 'status', 'description', 'template_id', 'components', 'raw_components', 'user_id'];

    protected $casts = [
        'components' => 'array',
        'raw_components' => 'array',
    ];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function revisions()
    {
        return $this->hasMany(PageRevision::class);
    }

    public function getSlugVal()
    {
        return $this->hasOne(PageSlug::class, '_id', 'page_slug');
    }

    public function getUserDetails()
    {
        return $this->belongsTo(User::class, 'user_id', '_id');
    }
}
