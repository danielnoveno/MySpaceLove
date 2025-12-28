<?php

return [
    'daily_message' => [
        'timezone' => env('DAILY_MESSAGE_TIMEZONE', env('APP_TIMEZONE', 'Asia/Jakarta')),
        'auto_generate_time' => env('DAILY_MESSAGE_AUTO_TIME', '05:00'),
    ],
];

