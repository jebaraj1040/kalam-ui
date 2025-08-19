<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

class ApiController extends Controller
{

    /**
     * Respond with a token and its details
     *
     * @param string $token
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60
        ]);
    }

    /**
     * Respond with a status, message, and optional data
     *
     * @param int $status
     * @param string $message
     * @param array $data
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respond($status = 200, $message = '', $data = [])
    {
        return response()->json([
            'status' => $status,
            'message' => $message,
            'data' => $data,
        ]);
    }
}
