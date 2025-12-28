<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistApiController extends Controller
{
    public function index(Space $space)
    {
        $this->authorizeSpace($space);
        return $space->wishlist()->get();
    }

    public function store(Request $r, Space $space)
    {
        $this->authorizeSpace($space);
        $data = $r->validate(['title' => 'required|string|max:255', 'description' => 'nullable|string', 'location' => 'nullable|string', 'notes' => 'nullable|string']);
        $data['space_id'] = $space->id;
        return WishlistItem::create($data);
    }

    public function update(Request $r, Space $space, $id)
    {
        $this->authorizeSpace($space);
        $item = WishlistItem::where('space_id', $space->id)->findOrFail($id);
        $data = $r->validate(['title' => 'required|string|max:255', 'description' => 'nullable|string', 'location' => 'nullable|string', 'status' => 'nullable|in:pending,done', 'notes' => 'nullable|string']);
        $item->update($data);
        return $item;
    }

    public function destroy(Space $space, $id)
    {
        $this->authorizeSpace($space);
        $item = WishlistItem::where('space_id', $space->id)->findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'deleted']);
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }
}
