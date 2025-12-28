<?php

namespace App\Http\Middleware;

use App\Models\Space;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSpaceAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $spaceParam = $request->route('space');

        if (!$spaceParam) {
            abort(404);
        }

        $space = $spaceParam instanceof Space
            ? $spaceParam
            : Space::where('slug', $spaceParam)->first();

        if (!$space) {
            abort(404);
        }

        $userId = $request->user()?->id;

        if (!$userId || !$space->hasMember($userId)) {
            abort(403, 'Kamu tidak memiliki akses ke space ini.');
        }

        $request->attributes->set('currentSpace', $space);

        return $next($request);
    }
}
