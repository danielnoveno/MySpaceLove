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
            'send_email' => 'Send to Email',
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
            'send_email' => 'Send to Email',
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
        'feedback' => [
            'email_sent' => 'Daily message sent to your partner via email! 💌',
            'email_failed' => 'We couldn\'t send the email. Please try again later.',
            'email_partner_missing' => 'Connect your partner and make sure their email is available before sending.',
        ],
    ],
    'emails' => [
        'daily_message' => [
            'subject' => ':sender shared a daily message for :partner (:date)',
            'heading' => 'A little love note just for you 💌',
            'greeting' => 'Hi :partner,',
            'intro' => ':sender sent you today\'s daily message from your space ":space".',
            'date_label' => 'Date',
            'message_label' => 'Message',
            'signature' => 'With love, :sender',
            'outro' => 'Sent with warmth by :appName',
            'sender_fallback' => 'Someone special',
            'partner_fallback' => 'you',
            'date_format' => 'F j, Y',
        ],
        'nobar_schedule' => [
            'subject' => 'Watch Party Reminder: :title',
            'heading' => 'Upcoming Watch Party 🍿',
            'greeting' => 'Hi :recipient,',
            'intro' => ':creator scheduled a watch party in your space ":space".',
            'schedule_label' => 'Scheduled for',
            'details_label' => 'Notes',
            'cta' => 'Open Watch Room',
            'footer' => 'Sent with care from :appName',
            'creator_fallback' => 'Someone special',
            'recipient_fallback' => 'there',
            'time_format' => 'F j, Y g:i A T',
        ],
    ],
];
