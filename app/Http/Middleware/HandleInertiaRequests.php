<?php

namespace App\Http\Middleware;

use App\Models\Space;
use Illuminate\Http\Request;
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
            $spaces = Space::query()
                ->where(function ($query) use ($user): void {
                    $query->where('user_one_id', $user->id)
                        ->orWhere('user_two_id', $user->id);
                })
                ->orderBy('title')
                ->get(['id', 'slug', 'title'])
                ->map(fn (Space $space): array => [
                    'id' => $space->id,
                    'slug' => $space->slug,
                    'title' => $space->title,
                ])
                ->values()
                ->all();

            $routeSpace = $request->attributes->get('currentSpace') ?? $request->route('space');

            if ($routeSpace instanceof Space) {
                $currentSpace = [
                    'id' => $routeSpace->id,
                    'slug' => $routeSpace->slug,
                    'title' => $routeSpace->title,
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
        ];
    }
}
