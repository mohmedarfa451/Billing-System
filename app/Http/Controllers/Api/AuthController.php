<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // تسجيل مستخدم جديد
    public function register(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'تم تسجيل الحساب بنجاح',
                'access_token' => $token,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // هنا بنمسك غلطة الإيميل المتكرر ونرجعها بمزاجنا
            return response()->json([
                'status' => false,
                'message' => 'عفواً، هذا الإيميل مسجل لدينا بالفعل',
                'errors' => $e->errors(),
            ], 422);
        }

    }

    // تسجيل الدخول
    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'status' => false,
                'message' => 'بيانات الدخول غير صحيحة'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    // تسجيل الخروج (مسح التوكن)
    public function logout(Request $request)
    {
        // بنجيب التوكن اللي اليوزر داخل بيه حالياً ونمسحه
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'تم تسجيل الخروج بنجاح وتم إبطال التوكن'
        ], 200);
    }
}