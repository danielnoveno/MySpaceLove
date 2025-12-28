<?php

namespace App\Http\Controllers;

use App\Mail\LocationShared;
use App\Models\Location;
use App\Models\Space;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function __construct(private readonly ActivityLogger $activityLogger)
    {
    }

    public function index(Request $request, Space $space): Response
    {
        $user = $request->user();
        $partner = $user ? $this->findPartner($user, $space) : null;

        $pendingInvitation = null;

        $space->loadMissing('pendingInvitation');
        $pendingInvitation = $space->pendingInvitation ? [
            'email' => $space->pendingInvitation->invitee_email,
            'status' => $space->pendingInvitation->status,
            'created_at' => optional($space->pendingInvitation->created_at)->toIso8601String(),
        ] : null;

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

        Log::info('Location update request', [
            'user_id' => $user?->id,
            'space_id' => $request->attributes->get('currentSpace')?->id,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
        ]);

        $location = Location::updateOrCreate(
            ['user_id' => $user->id],
            [
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
            ]
        )->fresh();

        Log::info('Location updated', [
            'user_id' => $user?->id,
            'location_id' => $location->id,
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
        ]);

        $this->logActivity(
            $user,
            'location.updated',
            __('app.notifications.events.location_updated.title'),
            __('app.notifications.events.location_updated.body'),
            [
                'latitude' => $location->latitude,
                'longitude' => $location->longitude,
            ],
            sendMail: false,
        );

        return response()->json([
            'message' => __('app.location.update_success'),
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
            abort(403, __('app.location.forbidden'));
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

        $this->logActivity(
            $user,
            'location.stopped',
            __('app.notifications.events.location_stopped.title'),
            __('app.notifications.events.location_stopped.body'),
            [],
            sendMail: false,
        );

        return response()->json([
            'message' => __('app.location.stop_success'),
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

        Log::info('Location share request', [
            'space_id' => $space->id,
            'user_id' => $user?->id,
            'partner_id' => $partner?->id,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
        ]);

        if (!$partner) {
            Log::warning('Location share failed - missing partner', [
                'space_id' => $space->id,
                'user_id' => $user?->id,
            ]);

            return response()->json([
                'message' => __('app.location.partner_missing'),
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

        $partnerName = $partner->name ?? __('app.layout.user.fallback_name');
        $actorName = $user->name ?? __('app.layout.user.fallback_name');

        $activityData = [
            'space_id' => $space->id,
            'share_url' => $data['url'],
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
        ];

        $this->logActivity(
            $user,
            'location.shared',
            __('app.notifications.events.location_shared_self.title', ['partner' => $partnerName]),
            __('app.notifications.events.location_shared_self.body', ['partner' => $partnerName]),
            $activityData
        );

        $this->logActivity(
            $partner,
            'location.shared.received',
            __('app.notifications.events.location_shared_partner.title', ['name' => $actorName]),
            __('app.notifications.events.location_shared_partner.body'),
            $activityData + ['from_user_id' => $user->id]
        );

        Log::info('Location share sent', [
            'space_id' => $space->id,
            'user_id' => $user->id,
            'partner_id' => $partner->id,
            'share_url' => $data['url'],
        ]);

        return response()->json([
            'message' => __('app.location.share_success'),
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

    private function logActivity($recipients, string $event, string $title, string $body, array $data = [], bool $sendMail = true): void
    {


        $this->activityLogger->log($recipients, $event, $title, $body, $data, $sendMail);
    }
}
