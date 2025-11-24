<?php

namespace App\Services\Tencent;

use RuntimeException;

class TuiRoomKitCredentialService
{
    public function generate(string $userId): array
    {
        $config = config('services.tencent.tui_room_kit');

        $sdkAppId = (int) ($config['sdk_app_id'] ?? 0);
        $secretKey = $config['secret_key'] ?? null;
        $ttl = (int) ($config['user_sig_ttl'] ?? 86400);

        if ($sdkAppId <= 0 || empty($secretKey)) {
            throw new RuntimeException('Tencent TUIRoomKit credentials are not configured.');
        }

        $generator = new TuiRoomKitUserSigGenerator($sdkAppId, $secretKey, max(60, $ttl));

        return $generator->forUser($userId);
    }
}
