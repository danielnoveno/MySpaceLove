<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class DailyApiController extends Controller
{
    protected string $baseUrl;
    protected ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl = env('DAILY_BASE_URL', 'https://api.daily.co/v1');
        $this->apiKey  = env('DAILY_API_KEY');
    }

    public function createRoom(Request $request)
    {
        $rid = (string) Str::uuid(); // request id biar gampang trace
        Log::info('[Daily] createRoom() called', [
            'rid' => $rid,
            'baseUrl' => $this->baseUrl,
            'apiKey_set' => $this->apiKey ? true : false, // jangan log key asli
            'ip' => $request->ip(),
            'user_id' => optional($request->user())->id,
        ]);

        if (!$this->apiKey) {
            Log::error('[Daily] DAILY_API_KEY missing', ['rid' => $rid]);
            return response()->json(['error' => 'DAILY_API_KEY is not set'], 500);
        }

        try {
            $payload = [
                'properties' => [
                    'enable_chat' => true,
                    'enable_screenshare' => true,
                    'start_audio_off' => false,
                    'start_video_off' => false,
                    'lang' => 'id',
                    'exp' => now()->addHours(1)->timestamp,
                ],
            ];

            Log::debug('[Daily] Request payload', ['rid' => $rid, 'payload' => $payload]);

            $response = Http::withToken($this->apiKey)
                ->withOptions([
                    'http_errors' => false,   // jangan throw exception otomatis
                    'timeout'     => 20,
                    'connect_timeout' => 10,
                ])
                ->post($this->baseUrl . '/rooms', $payload);

            Log::info('[Daily] HTTP response meta', [
                'rid' => $rid,
                'status' => $response->status(),
                'ok' => $response->ok(),
                'successful' => $response->successful(),
                'reason' => $response->reason(),
            ]);

            // log full body (hati2 ukuran)
            Log::debug('[Daily] HTTP response body', [
                'rid' => $rid,
                'body' => $response->json() ?? $response->body(),
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'Gagal membuat room Daily.co',
                    'status' => $response->status(),
                    'details' => $response->json() ?? $response->body(),
                    'rid' => $rid,
                ], 500);
            }

            $data = $response->json();

            Log::info('[Daily] Room created OK', [
                'rid' => $rid,
                'name' => $data['name'] ?? null,
                'url'  => $data['url'] ?? null,
            ]);

            return response()->json([
                'url' => $data['url'] ?? null,
                'name' => $data['name'] ?? null,
                'room' => $data,
                'rid' => $rid,
            ]);
        } catch (Throwable $e) {
            Log::error('[Daily] Exception on createRoom', [
                'rid' => $rid,
                'type' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
                'trace' => collect($e->getTrace())->take(5), // potong biar gak kebanyakan
            ]);

            return response()->json([
                'error' => 'Exception: ' . $e->getMessage(),
                'rid' => $rid,
            ], 500);
        }
    }

    public function listRooms(Request $request)
    {
        $rid = (string) Str::uuid();
        Log::info('[Daily] listRooms() called', ['rid' => $rid]);

        try {
            $response = Http::withToken($this->apiKey)
                ->withOptions(['http_errors' => false, 'timeout' => 15])
                ->get($this->baseUrl . '/rooms');

            Log::info('[Daily] listRooms status', [
                'rid' => $rid,
                'status' => $response->status(),
                'ok' => $response->ok()
            ]);
            Log::debug('[Daily] listRooms body', ['rid' => $rid, 'body' => $response->json() ?? $response->body()]);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'Gagal mengambil daftar rooms',
                    'status' => $response->status(),
                    'details' => $response->json() ?? $response->body(),
                    'rid' => $rid,
                ], 500);
            }

            return response()->json($response->json());
        } catch (Throwable $e) {
            Log::error('[Daily] Exception on listRooms', [
                'rid' => $rid,
                'msg' => $e->getMessage()
            ]);
            return response()->json(['error' => $e->getMessage(), 'rid' => $rid], 500);
        }
    }

    public function deleteRoom(Request $request, string $name)
    {
        $rid = (string) Str::uuid();
        Log::info('[Daily] deleteRoom() called', ['rid' => $rid, 'name' => $name]);

        try {
            $response = Http::withToken($this->apiKey)
                ->withOptions(['http_errors' => false, 'timeout' => 15])
                ->delete($this->baseUrl . '/rooms/' . $name);

            Log::info('[Daily] deleteRoom status', [
                'rid' => $rid,
                'status' => $response->status(),
                'ok' => $response->ok()
            ]);
            Log::debug('[Daily] deleteRoom body', ['rid' => $rid, 'body' => $response->json() ?? $response->body()]);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'Gagal menghapus room',
                    'status' => $response->status(),
                    'details' => $response->json() ?? $response->body(),
                    'rid' => $rid,
                ], 500);
            }

            return response()->json(['deleted' => true, 'rid' => $rid, 'body' => $response->json()]);
        } catch (Throwable $e) {
            Log::error('[Daily] Exception on deleteRoom', [
                'rid' => $rid,
                'msg' => $e->getMessage()
            ]);
            return response()->json(['error' => $e->getMessage(), 'rid' => $rid], 500);
        }
    }
}
