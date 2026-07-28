<?php

use App\Providers\AppServiceProvider;
use App\Providers\Filament\AdminPanelProvider;
use App\Providers\Filament\SpacePanelProvider;
use App\Providers\PerformanceServiceProvider;

return [
    AppServiceProvider::class,
    AdminPanelProvider::class,
    SpacePanelProvider::class,
    PerformanceServiceProvider::class,
];
