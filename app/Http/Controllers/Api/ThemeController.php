<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;

class ThemeController extends Controller
{
    public function index()
    {
        return Theme::all();
    }

    public function show($id)
    {
        return Theme::findOrFail($id);
    }
}
