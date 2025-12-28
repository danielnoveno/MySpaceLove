<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Feature Toggles
    |--------------------------------------------------------------------------
    |
    | Central place to enable/disable experimental or seasonal features.
    | Use environment variables to override per deployment.
    |
    */
    'nobar_enabled' => env('FEATURE_NOBAR_ENABLED', true),
];
