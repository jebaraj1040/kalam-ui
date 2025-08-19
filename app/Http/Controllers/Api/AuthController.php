<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends ApiController
{

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        Log::info('Inside ' . __METHOD__);

        $credentials = request(['email', 'password']);
        if (!$token = auth('api')->attempt($credentials)) {
            Log::error('Authorization failed for ' . $request->get('email'));
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        Log::info('Inside ' . __METHOD__);

        auth('api')->logout();
        Log::error('Successfully logged out ' . auth('api')->user()?->email);
        return $this->respond('Successfully logged out');
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        Log::info('Inside ' . __METHOD__);

        Log::info('Token refreshed for ' . auth('api')->user()?->email);
        return $this->respondWithToken(auth('api')->refresh());
    }
}
