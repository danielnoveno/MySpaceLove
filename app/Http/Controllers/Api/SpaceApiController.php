<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
        })->first();

        if ($existingPartnerSpace && $existingPartnerSpace->id !== $space->id) {
            return response()->json([
                'message' => 'Email tersebut sudah terhubung dengan space pasangan yang lain.',
            ], 422);
        }

        $space->user_two_id = $partner->id;
        $space->title = "{$user->name} & {$partner->name}";
        $space->save();

        return response()->json([
            'message' => 'Pasangan berhasil terhubung.',
            'partner' => [
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

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) {
            abort(403);
        }
    }
}
