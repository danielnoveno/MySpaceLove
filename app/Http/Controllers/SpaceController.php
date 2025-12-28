<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\SpaceInvitation;
use App\Models\SpaceSeparationRequest;
use App\Notifications\SpaceCreated;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class SpaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $userId = $user?->id;
        $spacesQuery = Space::query()
            ->where(function ($query) use ($userId): void {
                $query->where('user_one_id', $userId)
                    ->orWhere('user_two_id', $userId);
            });

        $relations = [
            'invitations' => function ($query): void {
                $query->orderByDesc('created_at');
            },
            'pendingInvitation',
            'pendingSeparationRequest',
        ];

        $spacesQuery->with($relations);

        $spacesQuery->with([
            'userOne:id,name,profile_image',
            'userTwo:id,name,profile_image',
        ]);

        $spaceModels = $spacesQuery
            ->orderByDesc('created_at')
            ->get(['id', 'slug', 'title', 'user_one_id', 'user_two_id']);

        $spaces = $spaceModels
            ->map(fn (Space $space): array => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
                'has_partner' => $space->user_two_id !== null,
                'users' => [
                    $space->userOne ? [
                        'id' => $space->userOne->id,
                        'name' => $space->userOne->name,
                        'profile_photo_url' => $space->userOne->profile_photo_url,
                    ] : null,
                    $space->userTwo ? [
                        'id' => $space->userTwo->id,
                        'name' => $space->userTwo->name,
                        'profile_photo_url' => $space->userTwo->profile_photo_url,
                    ] : null,
                ],
                'pending_invitation' => ($space->relationLoaded('pendingInvitation') && $space->pendingInvitation) ? [
                    'id' => $space->pendingInvitation->id,
                    'email' => $space->pendingInvitation->invitee_email,
                    'status' => $space->pendingInvitation->status,
                    'status_label' => SpaceInvitation::statusLabel($space->pendingInvitation->status),
                    'sent_at' => SpaceInvitation::formatTimestamp($space->pendingInvitation->created_at),
                ] : null,
                'pending_separation' => ($space->relationLoaded('pendingSeparationRequest') && $space->pendingSeparationRequest) ? [
                    'id' => $space->pendingSeparationRequest->id,
                    'status' => $space->pendingSeparationRequest->status,
                    'initiated_by_you' => $space->pendingSeparationRequest->initiator_id === $userId,
                    'requires_your_confirmation' => $space->pendingSeparationRequest->status === SpaceSeparationRequest::STATUS_PENDING
                        && $space->pendingSeparationRequest->partner_id === $userId
                        && $space->pendingSeparationRequest->partner_confirmed_at === null,
                    'created_at' => $space->pendingSeparationRequest->created_at?->toIso8601String(),
                    'reason' => [
                        'initiator' => $space->pendingSeparationRequest->initiator_reason,
                        'partner' => $space->pendingSeparationRequest->partner_reason,
                    ],
                ] : null,
                'invitations' => ($space->relationLoaded('invitations')) ? $space->invitations
                    ->map(fn (SpaceInvitation $invitation): array => [
                        'id' => $invitation->id,
                        'email' => $invitation->invitee_email,
                        'status' => $invitation->status,
                        'status_label' => SpaceInvitation::statusLabel($invitation->status),
                        'sent_at' => SpaceInvitation::formatTimestamp($invitation->created_at),
                        'responded_at' => SpaceInvitation::formatTimestamp($invitation->accepted_at),
                        'cancelled_at' => SpaceInvitation::formatTimestamp($invitation->cancelled_at),
                    ])
                    ->values()
                    ->all() : [],
            ])
            ->values();

        $pendingInvitations = collect();

        if ($user) {
            $pendingInvitations = SpaceInvitation::query()
                ->pending()
                ->where(function ($query) use ($user): void {
                    $query->where('invitee_id', $user->id)
                        ->orWhere('invitee_email', $user->email);
                })
                ->with('space:id,slug,title')
                ->get()
                ->map(fn (SpaceInvitation $invitation): array => [
                    'id' => $invitation->id,
                    'email' => $invitation->invitee_email,
                    'status' => $invitation->status,
                    'status_label' => SpaceInvitation::statusLabel($invitation->status),
                    'created_at' => $invitation->created_at?->toIso8601String(),
                    'space' => [
                        'id' => $invitation->space->id,
                        'slug' => $invitation->space->slug,
                        'title' => $invitation->space->title,
                    ],
                ])
                ->values();
        }

        $pendingSeparation = [];

        if ($user) {
            $pendingSeparation = SpaceSeparationRequest::query()
                ->pending()
                ->where(function ($query) use ($userId): void {
                    $query->where('initiator_id', $userId)
                        ->orWhere('partner_id', $userId);
                })
                ->with([
                    'space:id,slug,title',
                    'initiator:id,name',
                    'partner:id,name',
                ])
                ->get()
                ->map(fn (SpaceSeparationRequest $request): array => [
                    'id' => $request->id,
                    'space' => $request->space ? [
                        'id' => $request->space->id,
                        'slug' => $request->space->slug,
                        'title' => $request->space->title,
                    ] : null,
                    'initiator' => $request->initiator ? [
                        'id' => $request->initiator->id,
                        'name' => $request->initiator->name,
                    ] : null,
                    'partner' => $request->partner ? [
                        'id' => $request->partner->id,
                        'name' => $request->partner->name,
                    ] : null,
                    'initiated_by_you' => $request->initiator_id === $userId,
                    'requires_your_confirmation' => $request->partner_id === $userId && $request->partner_confirmed_at === null,
                    'created_at' => $request->created_at?->toIso8601String(),
                    'reason' => [
                        'initiator' => $request->initiator_reason,
                        'partner' => $request->partner_reason,
                    ],
                ])
                ->values()
                ->all();
        }

        return Inertia::render('Spaces/Index', [
            'spaces' => $spaces->all(),
            'status' => session('status'),
            'pendingInvitations' => $pendingInvitations->all(),
            'canCreate' => $spaceModels->isEmpty(),
            'pendingSeparationRequests' => $pendingSeparation,
            'separationConfirmationPhrase' => SpaceSeparationRequest::CONFIRMATION_PHRASE,
        ]);
    }

    /**
     * Store a newly created space.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
        ]);

        $alreadyInSpace = Space::query()
            ->where(function ($query) use ($user): void {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->exists();

        if ($alreadyInSpace) {
            throw ValidationException::withMessages([
                'title' => 'Kamu sudah memiliki Space. Tidak dapat membuat lebih dari satu.',
            ]);
        }

        $baseSlug = Str::slug($data['title']);

        if ($baseSlug === '') {
            $baseSlug = Str::slug($user->name) ?: 'space';
        }

        $slug = $this->makeUniqueSlug($baseSlug);

        $space = Space::create([
            'title' => $data['title'],
            'slug' => $slug,
            'user_one_id' => $user->id,
            'bio' => $data['bio'] ?? null,
        ]);

        $user->notify(new SpaceCreated($space));

        return redirect()
            ->route('spaces.dashboard', ['space' => $space->slug])
            ->with('status', __('app.spaces.flash.created'));
    }

    /**
     * Generate a unique slug for the space.
     */
    private function makeUniqueSlug(string $baseSlug): string
    {
        $slug = $baseSlug;
        $suffix = 1;

        while (Space::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
