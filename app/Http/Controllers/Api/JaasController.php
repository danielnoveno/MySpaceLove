<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Auth;

class JaasController extends Controller
{
    public function generateToken(Request $request, $slug)
    {
        $user = Auth::user();
        
        // Load configuration
        $appId = config('services.jaas.app_id'); // e.g., "vpaas-magic-cookie-..."
        $apiKey = config('services.jaas.api_key');
        $privateKey = config('services.jaas.private_key'); // Must include -----BEGIN PRIVATE KEY----- headers

        if (!$appId || !$apiKey || !$privateKey) {
            return response()->json(['message' => 'Server misconfiguration: Missing JaaS credentials.'], 500);
        }

        // Clean up private key if it's one line in .env
        // (Sometimes users put literal \n in .env, PHP env() might read it as literal characters)
        // If it's base64 encoded, decode it.
        // For now, let's assume standard key format. If it's wrapped in quotes in .env it should be fine.
        // A robust way to handle multi-line env vars is common issue.
        // Fix private key formatting (handle \n literals, quotes, and ensure PEM format)
        // 1. Unescape literal \n
        $privateKey = str_replace('\\n', "\n", $privateKey);
        // 2. Remove surrounding quotes if they were included in the value string itself (unlikely if processed by dotenv, but possible)
        $privateKey = trim($privateKey, '"\'');
        // 3. Ensure correctness of PEM structure
        if (strpos($privateKey, '-----BEGIN PRIVATE KEY-----') === false) {
             // Maybe user just pasted the body? reconstruct.
             // But usually it's safer to ask user to fix it. 
             // Let's assume user pasted valid key but maybe formatting issues.
        }

        $now = time();
        $exp = $now + 7200; // 2 hours
        $nbf = $now - 10;

        $roomName = "LoveSpace-{$slug}";
        
        $payload = [
            'aud' => 'jitsi',
            'iss' => 'chat',
            'sub' => $appId,
            'room' => '*', // Allow access to any room or restrict to specific room
            'iat' => $now,
            'exp' => $exp,
            'nbf' => $nbf,
            'context' => [
                'user' => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => "https://ui-avatars.com/api/?name=" . urlencode($user->name),
                    'moderator' => true 
                ],
                'features' => [
                    'livestreaming' => false,
                    'recording' => false,
                    'transcription' => false,
                    'outbound-call' => false
                ]
            ]
        ];

        // Header with kid
        $headers = [
            'kid' => $apiKey,
            'typ' => 'JWT'
        ];

        try {
            $token = JWT::encode($payload, $privateKey, 'RS256', $apiKey); // The 4th arg is head, wait... library version check.
            // firebase/php-jwt 6.x: encode(payload, key, alg, keyId, head)
            // But wait, the standard signature is encode($payload, $key, $alg, $keyId = null, $head = null)
            // Actually recent versions: public static function encode(array $payload, $key, string $alg, ?string $keyId = null, ?array $head = null): string
            
            $token = JWT::encode($payload, $privateKey, 'RS256', $apiKey);
            
            return response()->json([
                'token' => $token,
                'roomName' => $roomName,
                'appId' => $appId
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to generate token: ' . $e->getMessage()], 500);
        }
    }
}
