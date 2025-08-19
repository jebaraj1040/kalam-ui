<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleStoreRequest extends FormRequest
{
    public function authorize()
    {
        // Set to true or add your authorization logic here
        return true;
    }

    public function rules()
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name'), // unique role name
            ],
            'description' => [
                'required',
                'string',
                'max:1000',
            ],
        ];
    }
}
