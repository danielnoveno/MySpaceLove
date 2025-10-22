<?php

return [
    'common' => [
        'actions' => [
            'save' => 'Save',
            'cancel' => 'Cancel',
            'edit' => 'Edit',
            'delete' => 'Delete',
            'close' => 'Close',
            'confirm' => 'Confirm',
            'view_all' => 'View all',
            'clear' => 'Clear',
            'search' => 'Search',
            'regenerate' => 'Regenerate',
            'add' => 'Add',
            'update' => 'Update',
            'back' => 'Back',
            'connect' => 'Connect',
            'understand' => 'Got it',
        ],
        'states' => [
            'locked' => 'Locked',
            'empty' => 'No data yet.',
        ],
    ],
    'layout' => [
        'navigation' => [
            'dashboard' => 'Dashboard',
            'timeline' => 'Timeline',
            'daily_messages' => 'Daily Message',
            'gallery' => 'Gallery',
            'spotify' => 'Spotify Kit',
            'choose_space' => 'Choose Space',
            'manage_spaces' => 'Manage Spaces',
            'profile' => 'Profile',
            'logout' => 'Log Out',
            'locked_tooltip' => 'Couple features unlock after your partner joins.',
            'mobile_title' => 'Navigation',
        ],
        'user' => [
            'fallback_name' => 'User',
        ],
        'language' => [
            'label' => 'Language',
            'options' => [
                'en' => 'English',
                'id' => 'Bahasa Indonesia',
            ],
        ],
    ],
    'dashboard' => [
        'meta' => [
            'title' => 'Dashboard - :space',
        ],
        'header' => [
            'subtitle' => 'Your shared space',
        ],
        'modals' => [
            'daily_message' => [
                'title' => 'Today\'s Love Message',
            ],
            'locked' => [
                'title' => 'Feature Locked',
                'action' => 'Got it',
            ],
        ],
        'cards' => [
            'partner_pending' => [
                'title' => 'Partner not connected yet',
                'description' => 'Invite your partner so you can enjoy every feature together.',
                'cta' => 'Connect Partner',
            ],
            'timeline_total' => 'Total Timeline',
            'gallery_total' => 'Photos & Videos',
            'location_share' => [
                'title' => 'Location Sharing',
                'cta' => 'Open Map',
            ],
            'quick_actions' => [
                'title' => 'Quick Actions',
                'add_moment' => [
                    'label' => 'Add Moment',
                    'description' => 'Record a special memory',
                ],
                'upload_photo' => [
                    'label' => 'Upload Photo',
                    'description' => 'Save your memories',
                ],
                'daily_message' => [
                    'label' => 'Daily Messages',
                    'description' => 'Read love notes',
                ],
                'memory_lane' => [
                    'label' => 'Memory Lane Kit',
                    'description' => 'Three-stage surprise guide + storybook',
                ],
                'spotify' => [
                    'label' => 'Spotify Companion',
                    'description' => 'Sync music and moods remotely',
                ],
                'journal' => [
                    'label' => 'Write Journal',
                    'description' => 'Express your feelings',
                ],
                'nobar' => [
                    'label' => 'Join Watch Party',
                    'description' => 'Start a co-watching session',
                ],
            ],
            'upcoming_events' => [
                'title' => 'Upcoming Events',
                'empty' => 'No events scheduled yet. Create your first countdown!',
                'days_left' => ':count days left',
                'view_all' => 'View all',
            ],
            'recent_messages' => [
                'title' => 'Latest Messages',
                'empty' => 'No new messages yet. Write something special for your partner!',
                'show_more' => 'Read more',
                'show_less' => 'Hide',
                'view_all' => 'View all',
            ],
        ],
        'locks' => [
            'requires_partner' => 'Connect your partner first to unlock this feature.',
        ],
    ],
    'spaces' => [
        'meta' => [
            'title' => 'Spaces',
        ],
        'header' => [
            'title' => 'Manage Spaces',
            'subtitle' => 'Create, join, and manage your couple spaces.',
        ],
    ],
    'daily_messages' => [
        'meta' => [
            'title' => 'Daily Messages',
        ],
        'header' => 'Daily Messages',
        'title' => 'Our Daily Messages 💌',
        'actions' => [
            'search' => 'Search Messages',
            'add_manual' => '+ Add Manually',
            'regenerate_ai' => 'Regenerate AI',
        ],
        'empty' => 'No daily messages yet. AI will generate them automatically! ✨',
        'modal' => [
            'title' => 'Search Daily Messages',
            'keyword' => 'Keyword',
            'date' => 'Date (YYYY-MM-DD)',
        ],
        'expand' => [
            'more' => 'Read more',
            'less' => 'Read less',
        ],
    ],
];
