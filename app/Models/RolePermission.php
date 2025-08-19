<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class RolePermission extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'role_permissions';

    protected $fillable = ['role_id', 'permissions'];
    
}
