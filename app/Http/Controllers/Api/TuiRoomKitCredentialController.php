<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Space;
use App\Services\Tencent\TuiRoomKitCredentialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use RuntimeException;
use Throwable;

class TuiRoomKitCredentialController extends Controller
{
    public function __invoke(Request $request, Space $space, TuiRoomKitCredentialService $service): JsonResponse
    {
        $this->authorizeSpace($space);

        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        try {
            $credentials = $service->generate("user-{$user->getKey()}");
        } catch (RuntimeException $exception) {
            report($exception);

            return response()->json([
                'error' => 'Konfigurasi TUIRoomKit belum lengkap. Hubungi admin untuk menambahkan kredensial Tencent Cloud.',
            ], 500);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'error' => 'Gagal membuat kredensial TUIRoomKit. Coba beberapa saat lagi.',
            ], 500);
        }

        return response()->json([
            'sdkAppId' => $credentials['sdk_app_id'],
            'userId' => $credentials['user_id'],
            'userSig' => $credentials['user_sig'],
            'issuedAt' => $credentials['issued_at'],
            'expireAt' => $credentials['expire_at'],
        ]);
    }

    private function authorizeSpace(Space $space): void
    {
        if (! $space->hasMember(Auth::id())) {
            abort(403);
        }
    }
}
