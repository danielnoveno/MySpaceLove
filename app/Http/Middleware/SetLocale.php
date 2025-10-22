<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $availableLocales = Config::get('app.available_locales', []);
        $defaultLocale = Config::get('app.locale', 'en');

        $sessionLocale = null;

        if ($request->hasSession()) {
            $sessionLocale = $request->session()->get('locale');
        }

        $candidateLocales = [
            $sessionLocale,
            $request->cookie('locale'),
            $request->getPreferredLanguage($availableLocales),
        ];

        $resolvedLocale = $defaultLocale;

        foreach ($candidateLocales as $candidate) {
            if (is_string($candidate) && in_array($candidate, $availableLocales, true)) {
                $resolvedLocale = $candidate;
                break;
            }
        }

        if ($resolvedLocale !== App::getLocale()) {
            App::setLocale($resolvedLocale);
        }

        if ($request->hasSession() && $sessionLocale !== $resolvedLocale) {
            $request->session()->put('locale', $resolvedLocale);
        }

        return $next($request);
    }
}

