<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SpaceInvitation;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'username' => User::generateUniqueUsername(
                $request->name ?: Str::before($request->email, '@')
            ),
            'partner_code' => User::generatePartnerCode(),
        ]);

        event(new Registered($user));

        Auth::login($user);

        if (Schema::hasTable('space_invitations')) {
            $invitation = SpaceInvitation::query()
                ->pending()
                ->where(function ($query) use ($user): void {
                    $query->where('invitee_email', $user->email)
                        ->orWhere('invitee_id', $user->id);
                })
                ->with(['space.userOne'])
                ->first();

            if ($invitation && $invitation->space && $invitation->space->user_two_id === null) {
                $space = $invitation->space;

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

                return redirect()
                    ->route('spaces.dashboard', ['space' => $space->slug])
                    ->with('status', __('app.auth.flash.space_joined'));
            }
        }

        return redirect()
            ->route('spaces.index')
            ->with('status', __('app.auth.flash.space_welcome'));
    }

}
