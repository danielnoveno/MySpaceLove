<?php

namespace App\Http\Controllers;

use App\Mail\LocationShareMail;
use App\Models\Location;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $partner = $user ? $this->resolvePartner($user) : null;
        $location = $user ? Location::where('user_id', $user->id)->first() : null;

        return Inertia::render('Location/MapView', [
            'partner' => $partner ? [
                'id' => $partner->id,
                'name' => $partner->name,
                'email' => $partner->email,
            ] : null,
            'initialLocation' => $this->makeLocationPayload($location),
        ]);
    }

    public function publicShare(Request $request): Response
    {
        return Inertia::render('Location/Share', [
            'latitude' => $request->query('lat'),
            'longitude' => $request->query('lng'),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $location = Location::updateOrCreate(
            ['user_id' => $user->id],
            [
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
            ]
        );

        $partner = $this->resolvePartner($user);
        $partnerLocation = $partner
            ? Location::where('user_id', $partner->id)->first()
            : null;

        return response()->json([
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'updated_at' => optional($location->updated_at)->toIso8601String(),
            'partner_location' => $this->makeLocationPayload($partnerLocation),
        ]);
    }

    public function show(Request $request, User $user)
    {
        $authUser = $request->user();
        $partner = $this->resolvePartner($authUser);

        if (! $partner || $partner->id !== $user->id) {
            abort(403, 'You are not allowed to view this location.');
        }

        $location = Location::where('user_id', $user->id)->first();
        $selfLocation = Location::where('user_id', $authUser->id)->first();

        if (! $location) {
            return response()->json([
                'location' => null,
                'self_location' => $this->makeLocationPayload($selfLocation),
            ]);
        }

        return response()->json([
            'location' => $this->makeLocationPayload($location),
            'self_location' => $this->makeLocationPayload($selfLocation),
        ]);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();
        Location::where('user_id', $user->id)->delete();

        return response()->noContent();
    }

    public function share(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $partner = $this->resolvePartner($user);

        if (! $partner) {
            throw ValidationException::withMessages([
                'partner' => 'Pasangan belum terhubung dalam ruang manapun.',
            ]);
        }

        if (! $partner->email) {
            throw ValidationException::withMessages([
                'partner' => 'Email pasangan tidak tersedia.',
            ]);
        }

        $baseUrl = rtrim(config('app.frontend_url', config('app.url')), '/');
        $shareUrl = sprintf(
            '%s/location?lat=%s&lng=%s',
            $baseUrl,
            number_format((float) $data['latitude'], 6, '.', ''),
            number_format((float) $data['longitude'], 6, '.', '')
        );

        Mail::to($partner->email)->send(new LocationShareMail($user, $shareUrl));

        return response()->json([
            'share_url' => $shareUrl,
        ]);
    }

    private function resolvePartner(User $user): ?User
    {
        $space = Space::with(['userOne', 'userTwo'])
            ->where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id)
            ->first();

        if (! $space) {
            return null;
        }

        if ($space->user_one_id === $user->id) {
            return $space->userTwo;
        }

        return $space->userOne;
    }

    private function makeLocationPayload(?Location $location): ?array
    {
        if (! $location) {
            return null;
        }

        return [
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'updated_at' => optional($location->updated_at)->toIso8601String(),
        ];
    }
}
