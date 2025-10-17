<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Agora\RtcTokenBuilder2;

class AgoraController extends Controller
{
    public function token(Request $request)
    {
        $appID = env('AGORA_APP_ID');
        $appCertificate = env('AGORA_APP_CERTIFICATE');
        $channelName = $request->input('channelName', 'default');
        $uid = $request->input('uid', rand(1, 999999));
        $role = RtcTokenBuilder2::ROLE_PUBLISHER;

        // Token berlaku selama 1 jam
        $expireTimeInSeconds = 3600;
        $currentTimestamp = now()->timestamp;
        $privilegeExpiredTs = $currentTimestamp + $expireTimeInSeconds;

        // ✅ Bangun token
        $token = RtcTokenBuilder2::buildTokenWithUid(
            $appID,
            $appCertificate,
            $channelName,
            $uid,
            $role,
            $privilegeExpiredTs
        );

        return response()->json([
            'appID' => $appID,
            'channelName' => $channelName,
            'uid' => $uid,
            'token' => $token,
            'expiredAt' => $privilegeExpiredTs,
        ]);
    }
}
