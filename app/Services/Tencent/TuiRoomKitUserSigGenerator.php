<?php

namespace App\Services\Tencent;

use RuntimeException;

class TuiRoomKitUserSigGenerator
{
    public function __construct(
        private readonly int $sdkAppId,
        private readonly string $secretKey,
        private readonly int $ttlSeconds
    ) {
    }

    /**
     * Generate a credential payload for the given user identifier.
     *
     * @return array{
     *     sdk_app_id:int,
     *     user_id:string,
     *     user_sig:string,
     *     issued_at:int,
     *     expire_at:int
     * }
     */
    public function forUser(string $userId): array
    {
        $issuedAt = time();
        $userSig = $this->buildUserSig($userId, $issuedAt);

        return [
            'sdk_app_id' => $this->sdkAppId,
            'user_id' => $userId,
            'user_sig' => $userSig,
            'issued_at' => $issuedAt,
            'expire_at' => $issuedAt + $this->ttlSeconds,
        ];
    }

    private function buildUserSig(string $userId, int $issuedAt): string
    {
        $contentToSign = sprintf(
            "TLS.identifier:%s\nTLS.sdkappid:%d\nTLS.time:%d\nTLS.expire:%d\n",
            $userId,
            $this->sdkAppId,
            $issuedAt,
            $this->ttlSeconds
        );

        $signature = base64_encode(hash_hmac('sha256', $contentToSign, $this->secretKey, true));

        $payload = json_encode([
            'TLS.ver' => '2.0',
            'TLS.identifier' => $userId,
            'TLS.sdkappid' => $this->sdkAppId,
            'TLS.expire' => $this->ttlSeconds,
            'TLS.time' => $issuedAt,
            'TLS.sig' => $signature,
        ], JSON_UNESCAPED_SLASHES);

        if ($payload === false) {
            throw new RuntimeException('Failed to encode Tencent TUIRoomKit signature payload.');
        }

        $compressed = gzcompress($payload);

        if ($compressed === false) {
            throw new RuntimeException('Failed to compress Tencent TUIRoomKit signature payload.');
        }

        return $this->base64UrlEncode($compressed);
    }

    private function base64UrlEncode(string $value): string
    {
        return strtr(base64_encode($value), ['+' => '*', '/' => '-', '=' => '_']);
    }
}
