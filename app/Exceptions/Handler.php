<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Symfony\Component\ErrorHandler\Error\FatalError;
use Illuminate\Http\Response;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        $this->renderable(function (FatalError $e, $request) {
            if (str_contains($e->getMessage(), 'Maximum execution time of') && $request->expectsJson()) {
                return response()->json([
                    'message' => 'Server is taking too long to respond. Please try again later.',
                    'error_code' => 'MAX_EXECUTION_TIME_EXCEEDED'
                ], Response::HTTP_REQUEST_TIMEOUT);
            }

            if (str_contains($e->getMessage(), 'Maximum execution time of')) {
                return response()->view('errors.500-timeout', [], Response::HTTP_REQUEST_TIMEOUT);
            }
        });
    }
}
