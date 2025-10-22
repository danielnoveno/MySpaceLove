<?php

namespace App\Http\Middleware;

use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $spaces = [];
        $currentSpace = null;

        if ($user) {
            $hasInvitationTable = Schema::hasTable('space_invitations');
            $hasSeparationTable = Schema::hasTable('space_separation_requests');

            $spacesQuery = Space::query()
                ->where(function ($query) use ($user): void {
                    $query->where('user_one_id', $user->id)
                        ->orWhere('user_two_id', $user->id);
                });

            if ($hasSeparationTable || $hasInvitationTable) {
                $relations = [];

                if ($hasInvitationTable) {
                    $relations[] = 'pendingInvitation';
                }

                if ($hasSeparationTable) {
                    $relations[] = 'pendingSeparationRequest';
                }

                if (!empty($relations)) {
                    $spacesQuery->with($relations);
                }
            }

            $spaces = $spacesQuery
                ->orderBy('title')
                ->get(['id', 'slug', 'title', 'user_one_id', 'user_two_id'])
                ->map(fn (Space $space): array => [
                    'id' => $space->id,
                    'slug' => $space->slug,
                    'title' => $space->title,
                    'has_partner' => $space->user_two_id !== null,
                    'is_owner' => $space->user_one_id === $user->id,
                    'pending_invitation' => ($hasInvitationTable && $space->relationLoaded('pendingInvitation') && $space->pendingInvitation) ? [
                        'email' => $space->pendingInvitation->invitee_email,
                        'status' => $space->pendingInvitation->status,
                    ] : null,
                    'pending_separation' => ($hasSeparationTable && $space->relationLoaded('pendingSeparationRequest') && $space->pendingSeparationRequest) ? [
                        'id' => $space->pendingSeparationRequest->id,
                        'status' => $space->pendingSeparationRequest->status,
                        'initiator_id' => $space->pendingSeparationRequest->initiator_id,
                        'awaiting_partner' => $space->pendingSeparationRequest->partner_confirmed_at === null,
                    ] : null,
                ])
                ->values()
                ->all();

            $routeSpace = $request->attributes->get('currentSpace') ?? $request->route('space');

            if ($routeSpace instanceof Space) {
                $relations = [];

                if ($hasSeparationTable) {
                    $relations[] = 'pendingSeparationRequest';
                }

                if ($hasInvitationTable) {
                    $relations[] = 'pendingInvitation';
                }

                if (!empty($relations)) {
                    $routeSpace->loadMissing($relations);
                }

                $currentSpace = [
                    'id' => $routeSpace->id,
                    'slug' => $routeSpace->slug,
                    'title' => $routeSpace->title,
                    'has_partner' => $routeSpace->user_two_id !== null,
                    'is_owner' => $routeSpace->user_one_id === $user->id,
                    'pending_invitation' => ($hasInvitationTable && $routeSpace->pendingInvitation) ? [
                        'email' => $routeSpace->pendingInvitation->invitee_email,
                        'status' => $routeSpace->pendingInvitation->status,
                    ] : null,
                    'pending_separation' => ($hasSeparationTable && $routeSpace->pendingSeparationRequest) ? [
                        'id' => $routeSpace->pendingSeparationRequest->id,
                        'status' => $routeSpace->pendingSeparationRequest->status,
                        'initiator_id' => $routeSpace->pendingSeparationRequest->initiator_id,
                        'awaiting_partner' => $routeSpace->pendingSeparationRequest->partner_confirmed_at === null,
                    ] : null,
                ];
            } elseif (is_string($routeSpace)) {
                $space = collect($spaces)->firstWhere('slug', $routeSpace);

                if ($space) {
                    $currentSpace = $space;
                }
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'spaces' => $spaces,
            'currentSpace' => $currentSpace,
            'locale' => app()->getLocale(),
        ];
    }
}
