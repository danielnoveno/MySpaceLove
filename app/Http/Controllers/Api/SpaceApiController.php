<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PartnerConnectedMail;
use App\Mail\SeparationCancelledMail;
use App\Mail\SeparationRequestedMail;
use App\Mail\SeparationRespondedMail;
use App\Mail\SpaceInvitationMail;
use App\Models\Space;
use App\Models\SpaceInvitation;
use App\Models\SpaceSeparationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

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

        $user = $r->user();

        $alreadyInSpace = Space::query()
            ->where(function ($query) use ($user): void {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->exists();

        if ($alreadyInSpace) {
            return response()->json([
                'message' => 'Kamu sudah terhubung dengan sebuah Space. Tidak dapat membuat lebih dari satu.',
            ], 422);
        }

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

    public function show(Space $space)
    {
        $this->authorizeSpace($space);
        return response()->json($space);
    }

    public function update(Request $r, Space $space)
    {
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

    public function destroy(Space $space)
    {
        $this->authorizeSpace($space);
        $space->delete();
        return response()->json(['message' => 'deleted']);
    }

    public function connectPartner(Request $request, Space $space)
    {
        $user = $request->user();

        if (!Schema::hasTable('space_invitations')) {
            return response()->json([
                'message' => 'Fitur undangan belum siap. Jalankan migrasi untuk mengaktifkannya.',
            ], 503);
        }

        if ($space->user_one_id !== $user->id) {
            return response()->json([
                'message' => 'Hanya pemilik space yang dapat menambahkan pasangan.',
            ], 403);
        }

        if ($space->user_two_id) {
            return response()->json([
                'message' => 'Pasangan sudah terhubung di space ini.',
            ], 422);
        }

        $existingInvitation = $space->pendingInvitation()->first();

        $data = $request->validate(
            [
                'partner_name' => ['required', 'string', 'max:255'],
                'partner_email' => ['required', 'email', 'max:255'],
            ],
            [
                'partner_name.required' => 'Nama pasangan wajib diisi.',
                'partner_name.string' => 'Nama pasangan tidak valid.',
                'partner_name.max' => 'Nama pasangan maksimal 255 karakter.',
                'partner_email.required' => 'Email pasangan wajib diisi.',
                'partner_email.email' => 'Format email pasangan tidak valid.',
                'partner_email.max' => 'Email pasangan maksimal 255 karakter.',
            ]
        );

        if (strcasecmp($data['partner_email'], $user->email) === 0) {
            return response()->json([
                'message' => 'Tidak dapat menggunakan email yang sama dengan akun kamu.',
            ], 422);
        }

        if (
            $existingInvitation
            && strcasecmp($existingInvitation->invitee_email, $data['partner_email']) !== 0
        ) {
            return response()->json([
                'message' => 'Masih ada undangan yang menunggu konfirmasi. Batalkan undangan tersebut sebelum mengundang email yang berbeda.',
            ], 422);
        }

        $partner = User::where('email', $data['partner_email'])->first();
        $temporaryPassword = null;

        if (!$partner) {
            $temporaryPassword = Str::random(12);
            $partner = User::create([
                'name' => $data['partner_name'],
                'email' => $data['partner_email'],
                'password' => Hash::make($temporaryPassword),
                'username' => User::generateUniqueUsername(
                    $data['partner_name'] ?: Str::before($data['partner_email'], '@')
                ),
                'partner_code' => User::generatePartnerCode(),
            ]);
        } else {
            $partnerNeedsSave = false;

            if (!$partner->username) {
                $partner->username = User::generateUniqueUsername(
                    Str::before($partner->email, '@')
                );
                $partnerNeedsSave = true;
            }

            if (!$partner->partner_code) {
                $partner->partner_code = User::generatePartnerCode();
                $partnerNeedsSave = true;
            }

            if ($partnerNeedsSave) {
                $partner->save();
            }
        }

        $existingPartnerSpace = Space::where(function ($query) use ($partner) {
            $query->where('user_one_id', $partner->id)
                ->orWhere('user_two_id', $partner->id);
        })->where('id', '!=', $space->id)->first();

        if ($existingPartnerSpace) {
            return response()->json([
                'message' => 'Email tersebut sudah terhubung dengan space pasangan yang lain.',
            ], 422);
        }

        $invitation = $existingInvitation;

        if ($invitation) {
            $shouldRefreshToken = strcasecmp($invitation->invitee_email, $partner->email) !== 0;

            $invitation->inviter_id = $user->id;
            $invitation->invitee_id = $partner->id;
            $invitation->invitee_email = $partner->email;
            $invitation->status = 'pending';
            $invitation->accepted_at = null;

            if ($shouldRefreshToken) {
                $invitation->token = (string) Str::uuid();
            }

            $invitation->save();
        } else {
            $invitation = SpaceInvitation::create([
                'space_id' => $space->id,
                'inviter_id' => $user->id,
                'invitee_id' => $partner->id,
                'invitee_email' => $partner->email,
                'token' => (string) Str::uuid(),
                'status' => 'pending',
            ]);
        }

        $historyQuery = SpaceInvitation::query()
            ->where('space_id', $space->id)
            ->where('id', '!=', $invitation->id);

        if ($partner->id) {
            $historyQuery->where('invitee_id', $partner->id);
        } else {
            $historyQuery->where('invitee_email', $partner->email);
        }

        $invitationHistory = $historyQuery
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function (SpaceInvitation $item): array {
                return [
                    'id' => $item->id,
                    'email' => $item->invitee_email,
                    'status' => $item->status,
                    'status_label' => SpaceInvitation::statusLabel($item->status),
                    'sent_at' => SpaceInvitation::formatTimestamp($item->created_at),
                    'responded_at' => SpaceInvitation::formatTimestamp($item->accepted_at),
                    'cancelled_at' => SpaceInvitation::formatTimestamp($item->cancelled_at),
                ];
            })
            ->all();

        $this->sendMailSilently(
            $partner,
            new SpaceInvitationMail(
                $space,
                $user,
                $partner,
                $invitation,
                $temporaryPassword,
                $invitationHistory,
                SpaceInvitation::statusLabel($invitation->status)
            )
        );

        return response()->json([
            'message' => 'Undangan berhasil dikirim. Pasangan perlu login dan mengonfirmasi undangan tersebut.',
            'invitation' => [
                'id' => $invitation->id,
                'email' => $invitation->invitee_email,
                'status' => $invitation->status,
                'created_at' => $invitation->created_at?->toIso8601String(),
            ],
            'partner_account' => [
                'id' => $partner->id,
                'name' => $partner->name,
                'email' => $partner->email,
            ],
            'temporary_password' => $temporaryPassword,
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
        ]);
    }

    public function confirmPartner(Request $request, Space $space)
    {
        $user = $request->user();

        if (!Schema::hasTable('space_invitations')) {
            return response()->json([
                'message' => 'Fitur undangan belum siap. Jalankan migrasi untuk mengaktifkannya.',
            ], 503);
        }

        if ($space->user_one_id === $user->id) {
            return response()->json([
                'message' => 'Pemilik space tidak perlu mengonfirmasi undangan.',
            ], 422);
        }

        if ($space->user_two_id) {
            return response()->json([
                'message' => 'Pasangan sudah terhubung di space ini.',
            ], 422);
        }

        $invitation = $space->pendingInvitation()
            ->where(function ($query) use ($user): void {
                $query->where('invitee_id', $user->id)
                    ->orWhere('invitee_email', $user->email);
            })
            ->first();

        if (!$invitation) {
            return response()->json([
                'message' => 'Tidak ada undangan yang menunggu konfirmasi untuk akun ini.',
            ], 404);
        }

        $hasOtherSpace = Space::where(function ($query) use ($user): void {
            $query->where('user_one_id', $user->id)
                ->orWhere('user_two_id', $user->id);
        })->where('id', '!=', $space->id)->exists();

        if ($hasOtherSpace) {
            return response()->json([
                'message' => 'Kamu sudah terhubung dengan Space yang lain. Lepaskan Space tersebut sebelum menerima undangan.',
            ], 422);
        }

        $space->loadMissing('userOne');
        $space->user_two_id = $user->id;

        if ($space->userOne) {
            $space->title = "{$space->userOne->name} & {$user->name}";
        }

        $space->save();

        $invitation->update([
            'status' => 'accepted',
            'invitee_id' => $user->id,
            'accepted_at' => now(),
        ]);

        $this->sendMailSilently(
            $space->userOne,
            new PartnerConnectedMail($space, $user)
        );

        return response()->json([
            'message' => 'Undangan berhasil dikonfirmasi. Selamat datang di Space pasanganmu!',
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
        ]);
    }

    public function cancelInvitation(Request $request, Space $space, SpaceInvitation $invitation)
    {
        $this->authorizeSpace($space);

        if (!Schema::hasTable('space_invitations')) {
            return response()->json([
                'message' => 'Fitur undangan belum siap. Jalankan migrasi untuk mengaktifkannya.',
            ], 503);
        }

        $user = $request->user();

        if ($space->user_one_id !== $user->id) {
            return response()->json([
                'message' => 'Hanya pembuat Space yang dapat membatalkan undangan.',
            ], 403);
        }

        if ($invitation->space_id !== $space->id) {
            return response()->json([
                'message' => 'Undangan tidak ditemukan.',
            ], 404);
        }

        if ($invitation->status !== 'pending') {
            return response()->json([
                'message' => 'Undangan sudah diproses dan tidak dapat dibatalkan.',
            ], 422);
        }

        $invitation->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return response()->json([
            'message' => 'Undangan berhasil dibatalkan.',
            'invitation' => [
                'id' => $invitation->id,
                'status' => $invitation->status,
                'status_label' => SpaceInvitation::statusLabel($invitation->status),
                'cancelled_at' => SpaceInvitation::formatTimestamp($invitation->cancelled_at),
            ],
        ]);
    }

    public function requestJoin(Request $request)
    {
        $user = $request->user();

        $existingMembership = Space::where(function ($query) use ($user): void {
            $query->where('user_one_id', $user->id)
                ->orWhere('user_two_id', $user->id);
        })->first();

        if ($existingMembership) {
            return response()->json([
                'message' => 'Kamu sudah terhubung dengan sebuah Space.',
            ], 422);
        }

        $data = $request->validate(
            [
                'partner_code' => ['required', 'string', 'max:16'],
            ],
            [
                'partner_code.required' => 'Kode pasangan wajib diisi.',
                'partner_code.string' => 'Kode pasangan tidak valid.',
                'partner_code.max' => 'Kode pasangan maksimal 16 karakter.',
            ]
        );

        $partnerCode = strtoupper($data['partner_code']);

        $owner = User::where('partner_code', $partnerCode)->first();

        if (!$owner) {
            return response()->json([
                'message' => 'Kode pasangan tidak ditemukan. Pastikan kode yang diberikan pasangan sudah benar.',
            ], 422);
        }

        if ($owner->id === $user->id) {
            return response()->json([
                'message' => 'Tidak dapat bergabung menggunakan kode milik sendiri.',
            ], 422);
        }

        $space = Space::where('user_one_id', $owner->id)->first();

        if (!$space) {
            return response()->json([
                'message' => 'Pasangan belum memiliki Space yang aktif.',
            ], 422);
        }

        if ($space->user_two_id && $space->user_two_id !== $user->id) {
            return response()->json([
                'message' => 'Space tersebut sudah memiliki pasangan.',
            ], 422);
        }

        if ($space->user_two_id === $user->id) {
            return response()->json([
                'message' => 'Kamu sudah tergabung di Space tersebut.',
                'space' => [
                    'id' => $space->id,
                    'slug' => $space->slug,
                    'title' => $space->title,
                ],
            ]);
        }

        $invitation = null;

        if (Schema::hasTable('space_invitations')) {
            $invitation = SpaceInvitation::updateOrCreate(
                [
                    'space_id' => $space->id,
                    'invitee_id' => $user->id,
                ],
                [
                    'inviter_id' => $owner->id,
                    'invitee_email' => $user->email,
                    'token' => (string) Str::uuid(),
                    'status' => 'pending',
                ]
            );
        }

        $space->loadMissing('userOne');

        $space->user_two_id = $user->id;

        if ($space->userOne) {
            $space->title = "{$space->userOne->name} & {$user->name}";
        }

        $space->save();

        if ($invitation) {
            $invitation->update([
                'status' => 'accepted',
                'accepted_at' => now(),
            ]);
        }

        $this->sendMailSilently(
            $space->userOne,
            new PartnerConnectedMail($space, $user)
        );

        return response()->json([
            'message' => 'Berhasil bergabung dengan Space pasanganmu.',
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
        ]);
    }

    public function requestSeparation(Request $request, Space $space)
    {
        $this->authorizeSpace($space);

        if (!Schema::hasTable('space_separation_requests')) {
            return response()->json([
                'message' => 'Fitur pembubaran space belum tersedia. Pastikan migrasi sudah dijalankan.',
            ], 503);
        }

        $user = $request->user();

        $data = $request->validate(
            [
                'confirmation_phrase' => ['required', 'string'],
                'reason' => ['nullable', 'string', 'max:2000'],
            ],
            [
                'confirmation_phrase.required' => 'Ketik frasa konfirmasi untuk melanjutkan.',
            ]
        );

        if (trim(Str::upper($data['confirmation_phrase'])) !== Str::upper(SpaceSeparationRequest::CONFIRMATION_PHRASE)) {
            return response()->json([
                'message' => 'Frasa konfirmasi tidak sesuai. Ketik persis "' . SpaceSeparationRequest::CONFIRMATION_PHRASE . '".',
            ], 422);
        }

        $space->loadMissing(['pendingSeparationRequest', 'userOne', 'userTwo']);

        if ($space->pendingSeparationRequest && $space->pendingSeparationRequest->status === SpaceSeparationRequest::STATUS_PENDING) {
            return response()->json([
                'message' => 'Masih ada permintaan pembubaran yang menunggu konfirmasi.',
            ], 422);
        }

        $partnerId = null;
        $partnerName = null;

        if ($space->user_one_id === $user->id) {
            $partnerId = $space->user_two_id;
            $partnerName = $space->userTwo?->name;
        } elseif ($space->user_two_id === $user->id) {
            $partnerId = $space->user_one_id;
            $partnerName = $space->userOne?->name;
        }

        $reason = isset($data['reason']) && trim($data['reason']) !== '' ? trim($data['reason']) : null;

        if ($partnerId === null) {
            $spaceTitle = $space->title;
            $space->delete();

            return response()->json([
                'message' => 'Space "' . $spaceTitle . '" berhasil dihapus. Kamu bisa membuat Space baru kapan saja.',
                'redirect' => route('spaces.index', absolute: false),
            ]);
        }

        $separationRequest = SpaceSeparationRequest::create([
            'space_id' => $space->id,
            'initiator_id' => $user->id,
            'partner_id' => $partnerId,
            'status' => SpaceSeparationRequest::STATUS_PENDING,
            'initiator_reason' => $reason,
            'initiator_confirmed_at' => now(),
        ]);

        $partnerUser = User::find($partnerId);

        if ($partnerUser) {
            $this->sendMailSilently(
                $partnerUser,
                new SeparationRequestedMail($space, $user, $partnerUser, $reason)
            );
        }

        return response()->json([
            'message' => 'Permintaan pembubaran telah dikirim. Menunggu persetujuan ' . ($partnerName ?? 'pasanganmu') . '.',
            'separation_request' => [
                'id' => $separationRequest->id,
                'status' => $separationRequest->status,
                'initiated_by_you' => true,
            ],
        ], 201);
    }

    public function respondSeparation(Request $request, Space $space)
    {
        $this->authorizeSpace($space);

        if (!Schema::hasTable('space_separation_requests')) {
            return response()->json([
                'message' => 'Fitur pembubaran space belum tersedia. Pastikan migrasi sudah dijalankan.',
            ], 503);
        }

        $space->loadMissing(['pendingSeparationRequest']);

        $separation = $space->pendingSeparationRequest;

        if (! $separation || $separation->status !== SpaceSeparationRequest::STATUS_PENDING) {
            return response()->json([
                'message' => 'Tidak ada permintaan pembubaran yang perlu dikonfirmasi.',
            ], 404);
        }

        $user = $request->user();

        if ($separation->partner_id !== $user->id) {
            return response()->json([
                'message' => 'Permintaan ini tidak membutuhkan konfirmasi dari akunmu.',
            ], 403);
        }

        $separation->loadMissing(['initiator', 'partner']);

        $data = $request->validate(
            [
                'decision' => ['required', 'in:approve,reject'],
                'confirmation_phrase' => ['required', 'string'],
                'reason' => ['nullable', 'string', 'max:2000'],
            ],
            [
                'decision.required' => 'Pilih keputusan kamu.',
                'confirmation_phrase.required' => 'Ketik frasa konfirmasi untuk melanjutkan.',
            ]
        );

        if (trim(Str::upper($data['confirmation_phrase'])) !== Str::upper(SpaceSeparationRequest::CONFIRMATION_PHRASE)) {
            return response()->json([
                'message' => 'Frasa konfirmasi tidak sesuai. Ketik persis "' . SpaceSeparationRequest::CONFIRMATION_PHRASE . '".',
            ], 422);
        }

        $partnerReason = isset($data['reason']) && trim($data['reason']) !== '' ? trim($data['reason']) : null;

        if ($data['decision'] === 'reject') {
            $separation->update([
                'status' => SpaceSeparationRequest::STATUS_REJECTED,
                'partner_reason' => $partnerReason,
                'partner_confirmed_at' => now(),
            ]);

            $this->sendMailSilently(
                $separation->initiator,
                new SeparationRespondedMail(
                    $space,
                    $user,
                    $separation->initiator,
                    SpaceSeparationRequest::STATUS_REJECTED,
                    $partnerReason
                )
            );

            return response()->json([
                'message' => 'Kamu menolak permintaan pembubaran. Space tetap aktif.',
                'separation_request' => [
                    'id' => $separation->id,
                    'status' => $separation->status,
                ],
            ]);
        }

        $separation->update([
            'status' => SpaceSeparationRequest::STATUS_APPROVED,
            'partner_reason' => $partnerReason,
            'partner_confirmed_at' => now(),
        ]);

        $this->sendMailSilently(
            $separation->initiator,
            new SeparationRespondedMail(
                $space,
                $user,
                $separation->initiator,
                SpaceSeparationRequest::STATUS_APPROVED,
                $partnerReason
            )
        );

        $spaceTitle = $space->title;
        $space->delete();

        return response()->json([
            'message' => 'Kalian resmi mengakhiri Space "' . $spaceTitle . '". Semoga keputusan ini terbaik untuk kalian berdua.',
            'redirect' => route('spaces.index', absolute: false),
        ]);
    }

    public function cancelSeparation(Request $request, Space $space)
    {
        $this->authorizeSpace($space);

        if (!Schema::hasTable('space_separation_requests')) {
            return response()->json([
                'message' => 'Fitur pembubaran space belum tersedia. Pastikan migrasi sudah dijalankan.',
            ], 503);
        }

        $space->loadMissing(['pendingSeparationRequest']);

        $separation = $space->pendingSeparationRequest;

        if (! $separation || $separation->status !== SpaceSeparationRequest::STATUS_PENDING) {
            return response()->json([
                'message' => 'Tidak ada permintaan pembubaran yang dapat dibatalkan.',
            ], 404);
        }

        $user = $request->user();

        if ($separation->initiator_id !== $user->id) {
            return response()->json([
                'message' => 'Hanya pengaju permintaan yang dapat membatalkan proses ini.',
            ], 403);
        }

        $separation->loadMissing(['initiator', 'partner']);

        $separation->update([
            'status' => SpaceSeparationRequest::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        $this->sendMailSilently(
            $separation->partner,
            new SeparationCancelledMail($space, $separation->initiator, $separation->partner)
        );

        return response()->json([
            'message' => 'Permintaan pembubaran berhasil dibatalkan.',
        ]);
    }

    private function sendMailSilently(?User $recipient, Mailable $mailable): void
    {
        if (!$recipient || !filter_var($recipient->email, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        try {
            Mail::to($recipient->email)->send($mailable);
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) {
            abort(403);
        }
    }
}
