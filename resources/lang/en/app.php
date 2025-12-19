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
            'games' => 'Games',
            'notifications' => 'Notifications',
            'memory_lane' => 'Memory Lane Kit',
            'choose_space' => 'Choose Space',
            'manage_spaces' => 'Manage Spaces',
            'profile' => 'Profile',
            'logout' => 'Log Out',
            'locked_tooltip' => 'Couple features unlock after your partner joins.',
            'owner_only_tooltip' => 'Only the space owner can access this menu.',
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
    'auth' => [
        'layout' => [
            'badge' => 'Designed for couples who want to feel close',
            'title' => 'Create a living scrapbook for your love story.',
            'subtitle' => 'MySpaceLove brings your rituals, surprises, and daily check-ins into one cozy space.',
            'features' => [
                'Share countdowns, playlists, journals, and galleries effortlessly.',
                'Plan heartfelt surprises with guided Memory Lane kits.',
                'Stay connected with daily prompts and real-time updates.',
            ],
            'footer' => 'Loved by couples in long-distance relationships and those who live together.',
        ],
        'common' => [
            'email' => 'Email',
            'password' => 'Password',
            'name' => 'Full name',
            'confirm_password' => 'Confirm password',
            'remember_me' => 'Remember me',
            'google' => 'Continue with Google',
            'separator' => 'Email login',
        ],
        'flash' => [
            'google_login_success' => 'Signed in with Google successfully.',
            'space_joined' => 'You\'re now connected to your partner\'s space. 💖',
            'space_welcome' => 'Welcome! Create your first space or join your partner using their code.',
        ],
        'login' => [
            'meta_title' => 'Sign in',
            'title' => 'Welcome back',
            'subtitle' => 'Pick up where you left off and keep your shared spark alive.',
            'submit' => 'Sign in',
            'forgot_password' => 'Forgot password?',
            'google' => 'Sign in with Google',
            'register_prompt' => [
                'text' => "Don't have an account?",
                'cta' => 'Create one',
            ],
            'hero' => [
                'badge' => 'Reconnect daily',
                'title' => 'Bring your love story back online.',
                'subtitle' => 'Sign in to sync moments, countdowns, and heartfelt rituals.',
                'features' => [
                    'Unlock your private dashboard with memories and messages.',
                    'Write journals together and keep track of milestones.',
                    'Share playlists, galleries, and surprises in one space.',
                ],
            ],
        ],
        'register' => [
            'meta_title' => 'Create account',
            'title' => 'Create your space',
            'subtitle' => 'Start a shared sanctuary for every little moment that matters.',
            'submit' => 'Create account',
            'google' => 'Sign up with Google',
            'login_prompt' => [
                'text' => 'Already have an account?',
                'cta' => 'Sign in',
            ],
            'hero' => [
                'badge' => 'Start fresh together',
                'title' => 'Build a space that grows with your relationship.',
                'subtitle' => 'Invite your partner, craft surprises, and cherish every milestone.',
                'features' => [
                    'Personalise your couple dashboard in minutes.',
                    'Connect playlists, countdowns, and love journals.',
                    'Unlock guided surprise kits and remote rituals.',
                ],
            ],
        ],
        'profile' => [
            'badge' => 'Settings',
            'title' => 'Profile & security',
            'subtitle' => 'Manage how you show up in your shared space and keep everything secure.',
            'sections' => [
                'information' => [
                    'title' => 'Profile information',
                    'description' => 'Refresh how your name and email appear across your shared experiences.',
                    'fields' => [
                        'name' => 'Display name',
                        'email' => 'Email address',
                    ],
                    'verification' => [
                        'notice' => 'Your email address is unverified.',
                        'action' => 'Resend verification email.',
                        'sent' => 'We sent a new verification link to your inbox.',
                    ],
                    'actions' => [
                        'save' => 'Save changes',
                        'saved' => 'Saved!',
                    ],
                ],
                'password' => [
                    'title' => 'Update password',
                    'description' => 'Keep your shared space safe with a strong, unique password.',
                    'fields' => [
                        'current' => 'Current password',
                        'new' => 'New password',
                        'confirm' => 'Confirm new password',
                    ],
                    'actions' => [
                        'save' => 'Update password',
                        'saved' => 'Password updated!',
                    ],
                ],
                'delete' => [
                    'title' => 'Delete account',
                    'description' => 'This action permanently removes your data from MySpaceLove. Consider downloading anything you want to keep first.',
                    'cta' => 'Delete account',
                    'modal' => [
                        'title' => 'Are you sure you want to delete your account?',
                        'description' => 'This action cannot be undone. Enter your password to confirm and permanently remove your account.',
                        'password_placeholder' => 'Password',
                        'cancel' => 'Cancel',
                        'confirm' => 'Yes, delete account',
                    ],
                ],
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
                'memory_lane_setup' => [
                    'label' => 'Configure Memory Lane',
                    'description' => 'Upload puzzle photos & level messages',
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
            'requires_owner' => 'Only the space owner can manage this feature.',
            'owner_badge' => 'Owner only',
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
        'flash' => [
            'created' => 'Space created successfully! Invite your partner anytime.',
        ],
    ],
    'location' => [
        'update_success' => 'Location updated successfully.',
        'forbidden' => "You don't have permission to view your partner's location.",
        'stop_success' => 'Stopped sharing your location.',
        'partner_missing' => 'Your partner has not connected to MySpaceLove yet.',
        'share_success' => 'Location link sent to your partner.',
    ],
    'notifications' => [
        'meta' => [
            'title' => 'Activity notifications',
        ],
        'header' => [
            'title' => 'Activity center',
            'subtitle' => 'All of your shared milestones, updates, and invitations in one place.',
        ],
        'actions' => [
            'mark_all_read' => 'Mark all as read',
            'filter_all' => 'All',
            'filter_unread' => 'Unread',
            'mark_read' => 'Mark as read',
        ],
        'summary' => [
            'recent' => 'Recent activity',
            'unread_count' => ':count unread notifications',
        ],
        'empty' => [
            'title' => 'No notifications yet',
            'body' => 'We will store every activity from your space right here.',
        ],
        'view' => [
            'opened_at' => 'Opened :date',
        ],
        'flash' => [
            'marked' => 'Notification marked as read.',
            'marked_all' => 'All notifications marked as read.',
        ],
        'mail' => [
            'greeting' => 'Hi :name,',
            'action' => 'View activity',
            'footer' => 'Thank you for staying connected with MySpaceLove 💖',
        ],
        'events' => [
            'account_registered' => [
                'title' => 'Welcome to MySpaceLove, :name!',
                'body' => 'Your account is ready. Invite your partner to start sharing memories.',
            ],
            'location_shared_self' => [
                'title' => 'You shared your location with :partner',
                'body' => 'We saved the link and coordinates so you can revisit the moment anytime.',
            ],
            'location_shared_partner' => [
                'title' => ':name just shared their location with you',
                'body' => 'Open the shared link to explore their latest location together.',
            ],
            'location_updated' => [
                'title' => 'Location updated',
                'body' => 'We refreshed your latest coordinates for your shared map.',
            ],
            'location_stopped' => [
                'title' => 'Location sharing paused',
                'body' => 'We stopped sharing your live location with your partner.',
            ],
            'timeline_created' => [
                'title' => ':actor added a new memory to the timeline',
                'body' => '":title" is ready to relive together on :date.',
                'action' => 'Open timeline',
            ],
            'countdown_created' => [
                'title' => ':actor planned a new upcoming event',
                'body' => 'Countdown ":title" is scheduled for :date. Get prepared for the surprise!',
                'action' => 'View countdowns',
            ],
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
