<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Storage optimization scheduled tasks
Schedule::command('storage:cleanup')->weekly()->sundays()->at('02:00');
Schedule::command('storage:report')->weekly()->mondays()->at('09:00');
