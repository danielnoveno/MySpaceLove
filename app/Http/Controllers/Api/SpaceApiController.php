<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class SpaceApiController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        // spaces where user is either user_one or user_two
        $spaces = Space::where('user_one_id', $userId)->orWhere('user_two_id', $userId)->get();
        return response()->json($spaces);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'title' => 'required|string|max:255',
            'slug'  => 'nullable|string|max:255|unique:spaces,slug',
            'bio'   => 'nullable|string',
            'invite_email' => 'nullable|email'
        ]);

        $slug = $data['slug'] ?? Str::slug($data['title'] . '-' . uniqid());
        $space = Space::create([
            'title' => $data['title'],
            'slug'  => $slug,
            'user_one_id' => Auth::id(),
            'bio' => $data['bio'] ?? null
        ]);

        // invite flow could be added: send email with token

        return response()->json($space, 201);
    }

    public function show($id)
    {
        $space = Space::findOrFail($id);
        $this->authorizeSpace($space);
        return response()->json($space);
    }

    public function update(Request $r, $id)
    {
        $space = Space::findOrFail($id);
        $this->authorizeSpace($space);

        $data = $r->validate([
            'title' => 'nullable|string|max:255',
            'bio'   => 'nullable|string',
            'is_public' => 'nullable|boolean',
            'theme_id'  => 'nullable|exists:themes,id',
        ]);

        $space->update($data);
        return response()->json($space);
    }

    public function destroy($id)
    {
        $space = Space::findOrFail($id);
        $this->authorizeSpace($space);
        $space->delete();
        return response()->json(['message' => 'deleted']);
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }
}
