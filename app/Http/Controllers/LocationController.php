<?php

namespace App\Http\Controllers;

use App\Mail\LocationShared;
use App\Models\Location;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(Request $request, Space $space): Response
    {
        $user = $request->user();
        $partner = $user ? $this->findPartner($user, $space) : null;

        $pendingInvitation = null;

        if (Schema::hasTable('space_invitations')) {
            $space->loadMissing('pendingInvitation');
            $pendingInvitation = $space->pendingInvitation ? [
                'email' => $space->pendingInvitation->invitee_email,
                'status' => $space->pendingInvitation->status,
                'created_at' => optional($space->pendingInvitation->created_at)->toIso8601String(),
            ] : null;
        }

        $userLocation = $user?->location;
        $partnerLocation = $partner?->location;

        return Inertia::render('Location/MapView', [
            'partner' => $partner ? [
                'id' => $partner->id,
                'name' => $partner->name,
                'email' => $partner->email,
            ] : null,
            'userLocation' => $userLocation ? [
                'latitude' => $userLocation->latitude,
                'longitude' => $userLocation->longitude,
                'updated_at' => optional($userLocation->updated_at)->toIso8601String(),
            ] : null,
            'partnerLocation' => $partnerLocation ? [
                    'latitude' => $partnerLocation->latitude,
                    'longitude' => $partnerLocation->longitude,
                    'updated_at' => optional($partnerLocation->updated_at)->toIso8601String(),
                ] : null,
            'shareBaseUrl' => rtrim(config('app.url'), '/') . '/location/' . $space->slug,
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
            'pendingInvitation' => $pendingInvitation,
        ]);
    }

    public function publicView(Request $request, Space $space): Response
    {
        $latitude = $request->query('lat');
        $longitude = $request->query('lng');

        return Inertia::render('Location/Share', [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $user = $request->user();

        $location = Location::updateOrCreate(
            ['user_id' => $user->id],
            [
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
            ]
        )->fresh();

        return response()->json([
            'message' => 'Lokasi berhasil diperbarui.',
            'location' => [
                'latitude' => $location->latitude,
                'longitude' => $location->longitude,
                'updated_at' => optional($location->updated_at)->toIso8601String(),
            ],
        ]);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $viewer = $request->user();

        if (!$viewer || !$this->arePartners($viewer, $user)) {
            abort(403, 'Tidak memiliki akses ke lokasi pasangan.');
        }

        $location = $user->location;

        return response()->json([
            'location' => $location ? [
                'latitude' => $location->latitude,
                'longitude' => $location->longitude,
                'updated_at' => optional($location->updated_at)->toIso8601String(),
            ] : null,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();
        $user?->location()?->delete();

        return response()->json([
            'message' => 'Berhenti membagikan lokasi.',
        ]);
    }

    public function share(Request $request, Space $space): JsonResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'url' => ['required', 'url'],
        ]);

        $user = $request->user();
        $partner = $this->findPartner($user, $space);

        if (!$partner) {
            return response()->json([
                'message' => 'Pasangan belum terhubung di MySpaceLove.',
            ], 422);
        }

        $location = Location::updateOrCreate(
            ['user_id' => $user->id],
            [
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
            ]
        )->fresh();

        Mail::to($partner->email)->send(new LocationShared(
            $user,
            $partner,
            $data['url'],
            $location->latitude,
            $location->longitude,
        ));

        return response()->json([
            'message' => 'Link lokasi berhasil dikirim ke pasangan.',
            'share_url' => $data['url'],
        ]);
    }

    private function findPartner(User $user, ?Space $specificSpace = null): ?User
    {
        $space = $specificSpace ?? Space::where(function ($query) use ($user) {
            $query->where('user_one_id', $user->id)
                ->orWhere('user_two_id', $user->id);
        })->first();

        if (!$space) {
            return null;
        }

        $partnerId = $space->user_one_id === $user->id
            ? $space->user_two_id
            : $space->user_one_id;

        return $partnerId ? User::find($partnerId) : null;
    }

    private function arePartners(User $viewer, User $target, ?Space $space = null): bool
    {
        $partner = $this->findPartner($viewer, $space);

        return $partner?->id === $target->id;
    }
}
