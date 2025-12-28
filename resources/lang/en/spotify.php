<?php

return [
    'meta' => [
        'title' => 'Spotify Companion Kit',
        'page_title' => 'Spotify Companion Kit',
    ],
    
    'header' => [
        'title' => 'Spotify Companion Kit',
        'subtitle' => 'Space :space: sync music, moods, and moments to stay close despite the distance.',
    ],
    
    'tabs' => [
        'home' => 'Home',
        'search' => 'Search',
        'playlist' => 'Playlist',
        'stats' => 'Stats',
    ],
    
    'auth' => [
        'connect' => 'Login with Spotify',
        'connecting' => 'Connecting…',
        'description' => 'Sync both Spotify Premium accounts to share a private player, curate playlists, and celebrate every vibe together.',
        'requirements' => 'Spotify Premium is required for both partners to access the full experience.',
    ],
    
    'connection' => [
        'title' => 'Spotify Connection Status',
        'description' => 'Each account needs to be connected for playlist sync, mood tracking, and surprises to work optimally.',
        'you' => 'You',
        'partner' => 'Partner',
        'connected' => 'Connected',
        'not_connected' => 'Not connected',
        'connected_at' => 'Connected :date',
        'connect_button' => 'Connect',
        'connect_title' => 'Connect Spotify',
        'connect_description' => 'Connect your Spotify accounts to enable playlist sync, mood check-ins, and song surprises.',
    ],
    
    'player' => [
        'now_playing' => 'Currently Playing',
        'not_playing' => 'Nothing is playing right now.',
        'play' => 'Play',
        'pause' => 'Pause',
        'next' => 'Next',
        'previous' => 'Previous',
        'device_picker' => 'Choose device',
    ],
    
    'search' => [
        'placeholder' => 'Search songs, artists, or albums',
        'results_title' => 'Search results',
        'empty' => 'Start typing to find songs together.',
        'play' => 'Play preview',
        'add' => 'Add to playlist',
    ],
    
    'playlist' => [
        'title' => 'Synced Playlist',
        'description' => 'Playlist automatically updates whenever you add your favorite songs this week.',
        'create' => 'Create Our Playlist',
        'creating' => 'Creating…',
        'empty' => 'No couple playlist yet. Start with your favourite love songs.',
        'tracks_title' => 'Playlist tracks',
        'remove' => 'Remove',
        'total_tracks' => 'Total songs',
        'new_this_week' => 'Added this week',
        'average_energy' => 'Average energy',
        'latest_song' => 'Latest song',
        'added_at' => 'Added :date',
        'added_on' => 'Added on :date',
        'open_spotify' => 'Open in Spotify',
        'listen_highlights' => 'Listen to favorite snippets',
        'preview_unavailable' => 'Preview unavailable, open in Spotify to play full track.',
        'audio_unsupported' => 'Your browser does not support HTML5 audio.',
    ],
    
    'mood' => [
        'title' => 'Mood Check-In',
        'description' => 'Share what you\'re listening to and how you\'re feeling right now.',
        'empty' => 'No mood snapshots yet. Share your first vibe!',
        'log_mood' => 'Log Mood',
        'your_mood' => 'Your mood',
        'partner_mood' => 'Partner\'s mood',
        'played_at' => 'Played :date',
        'energy' => 'Energy',
        'affection' => 'Affection',
    ],
    
    'listening' => [
        'title' => 'Live Listening',
        'description' => 'See what your partner is playing right now and join the session.',
        'is_live' => ':host is listening live',
        'not_live' => 'No one is listening right now.',
        'join_button' => 'Join Playback',
        'started_at' => 'Started :date',
        'listeners' => ':count listeners',
    ],
    
    'surprise' => [
        'title' => 'Surprise Drops',
        'description' => 'Schedule surprise songs for your partner to discover at the perfect moment.',
        'empty' => 'No surprise drops scheduled yet. Plan your first musical surprise!',
        'add_button' => 'Add Surprise',
        'modal_title' => 'Schedule Surprise Drop',
        'track_input_label' => 'Spotify track link or ID',
        'track_input_placeholder' => 'Paste Spotify link or track ID',
        'scheduled_for_label' => 'Schedule for',
        'note_label' => 'Personal note (optional)',
        'note_placeholder' => 'Add a sweet message...',
        'submit_button' => 'Schedule Surprise',
        'submitting' => 'Scheduling...',
        'scheduled_for' => 'Scheduled for :date',
        'curator' => 'By :name',
    ],
    
    'capsule' => [
        'title' => 'Memory Capsules',
        'description' => 'Save songs tied to special moments and memories you\'ve shared together.',
        'empty' => 'No memory capsules yet. Start preserving your musical memories!',
        'add_button' => 'Add Capsule',
        'modal_title' => 'Save Memory Capsule',
        'track_input_label' => 'Spotify track link or ID',
        'track_input_placeholder' => 'Paste Spotify link or track ID',
        'moment_label' => 'Moment title',
        'moment_placeholder' => 'e.g., First date, Road trip, Anniversary...',
        'description_label' => 'Memory description (optional)',
        'description_placeholder' => 'Describe this special moment...',
        'saved_at_label' => 'Memory date (optional)',
        'submit_button' => 'Save Capsule',
        'submitting' => 'Saving...',
        'saved_at' => 'Saved :date',
        'play_preview' => 'Play preview',
    ],
    
    'stats' => [
        'top_tracks' => 'Our Top Songs',
        'top_artists' => 'Our Top Artists',
        'compatibility' => 'Music compatibility',
        'compatibility_empty' => 'Connect both partners to compare your top vibes.',
    ],
    
    'loading' => [
        'dashboard' => 'Loading Spotify data...',
        'retry' => 'Try Reload',
    ],
    
    'messages' => [
        'success' => [
            'surprise_scheduled' => 'Surprise song successfully scheduled!',
            'capsule_saved' => 'Memory capsule successfully saved!',
            'playback_synced' => 'Your playback is now synced with the live session.',
        ],
        'error' => [
            'load_failed' => 'Failed to load Spotify data.',
            'invalid_track' => 'Enter a valid Spotify track link or ID.',
            'surprise_failed' => 'Failed to schedule surprise song. Try again.',
            'capsule_failed' => 'Failed to save memory capsule. Try again.',
            'no_playback' => 'No playback session available to join right now.',
            'join_failed' => 'Failed to join playback. Make sure your Spotify is active.',
            'join_retry' => 'Failed to join playback. Try again in a moment.',
        ],
    ],
    
    'errors' => [
        'general' => 'Something went wrong with the Spotify connection.',
        'token_missing' => 'Connect Spotify first to unlock this feature.',
        'playback' => 'Unable to control playback. Make sure a Spotify device is active.',
        'search' => 'Unable to fetch search results right now.',
    ],
];
