<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function success($data, $message = 'تمت العملية بنجاح', $code = 200)
    {
        return response()->json([
            'status' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    protected function error($message, $code = 400)
    {
        return response()->json([
            'status' => false,
            'message' => $message,
            'data' => null
        ], $code);
    }   
}
