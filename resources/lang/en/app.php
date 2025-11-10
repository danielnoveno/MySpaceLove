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
            'refresh' => 'Refresh',
        ],
        'states' => [
            'locked' => 'Locked',
            'empty' => 'No data yet.',
        ],
    ],
    'uploads' => [
        'errors' => [
            'generic_file_too_large' => 'The uploaded file exceeds 10 MB. Please compress or choose another file.',
            'generic_file_save_failed' => 'We could not save the uploaded file. Please try again.',
            'image_conversion_failed' => 'We could not process this image. Please upload a JPG or PNG file under 10 MB.',
            'memory_lane_image_too_large' => 'Each Memory Lane Kit image must be a maximum of 10 MB.',
            'timeline_media_too_large' => 'File size too large. Maximum 10 MB for memory and special moment photos.',
            'event_poster_too_large' => 'Event poster file is too large. Maximum allowed size is 10 MB.',
            'profile_image_too_large' => 'Profile picture is too large. Maximum 10 MB and will be converted to .webp.',
        ],
        'success' => [
            'memory_lane_saved' => 'Memory Lane configuration has been saved successfully.',
        ],
    ],
    'memory_lane' => [
        'flash' => [
            'saved' => 'Memory Lane configuration has been saved successfully.',
            'pin_updated' => 'Memory Lane PIN has been updated.',
        ],
        'validation' => [
            'pin_invalid' => 'The PIN you entered is incorrect.',
        ],
        'editor' => [
            'meta_title' => 'Memory Lane Kit',
            'title' => 'Memory Lane Kit configuration',
            'description' => 'Customize the reveal for each puzzle level in :spaceTitle so every milestone feels personal.',
            'access' => [
                'title' => 'Access settings',
                'description' => 'Set a PIN to protect your Memory Lane Kit. Leave it blank if you want everyone with the link to enjoy it.',
                'pin_label' => 'Access PIN (leave empty for no PIN)',
                'pin_placeholder' => 'Example: 1234',
                'empty_notice' => 'Memory Lane Kit content has not been configured yet. Visitors will not see anything until you fill at least one level.',
            ],
            'level' => [
                'badge' => 'Level :number',
                'preview_alt' => 'Preview image for level :number',
                'empty_image' => 'No image yet',
                'upload' => 'Choose image',
                'reset' => 'Use default image',
                'title_label' => 'Completion message title',
                'title_placeholder' => 'Example: Mission accomplished!',
                'body_label' => 'Message body',
                'body_placeholder' => 'Share the story or affirmation after this level.',
            ],
            'actions' => [
                'submit' => 'Save configuration',
                'saving' => 'Saving…',
            ],
        ],
    ],
    'storybook' => [
        'page_label' => 'Page :number',
        'progress_template' => ':current of :total',
        'actions' => [
            'start' => 'Open scrapbook',
            'previous' => 'Previous memory',
            'next' => 'Next memory',
            'back' => 'Back to overview',
        ],
        'empty' => 'No scrapbook memories yet. Configure the Memory Lane Kit to add pages.',
        'manage' => 'Manage Memory Lane Kit',
    ],
    'spotify' => [
        'auth' => [
            'state_missing' => 'Spotify state payload was not found.',
            'state_invalid' => 'Spotify state payload is invalid.',
            'session_invalid' => 'Your session expired. Please sign in again.',
            'authorization_code_missing' => 'Spotify authorization code was not found.',
            'exchange_failed' => 'Failed to exchange the Spotify code. Please try again.',
            'success' => 'Spotify connected successfully!',
            'token_missing' => 'Spotify token could not be found. Please reconnect.',
        ],
        'music_space' => [
            'meta_title' => 'Couple Music Space',
            'header' => [
                'title' => 'Our Music Space',
                'subtitle' => 'Connect your Spotify Premium accounts, search songs together, and curate a shared playlist.',
            ],
            'tabs' => [
                'home' => 'Home',
                'search' => 'Search',
                'playlist' => 'Playlist',
                'stats' => 'Stats',
            ],
            'connect' => [
                'headline' => 'Connect Spotify',
                'description' => 'Link your Spotify accounts to enable shared playback, playlists, and live status updates.',
                'connect_button' => 'Login with Spotify',
                'connected' => 'Connected as :name',
                'partner_status' => 'Partner connections',
                'partner_connected' => ':name connected',
                'partner_missing' => 'Waiting for partner to connect',
            ],
            'player' => [
                'title' => 'Currently playing',
                'empty' => 'Nothing is playing right now. Start Spotify on any device to see live updates.',
                'play' => 'Play',
                'pause' => 'Pause',
                'next' => 'Next',
                'previous' => 'Previous',
                'cover_alt' => 'Album art for the current track',
            ],
            'search' => [
                'title' => 'Search songs',
                'placeholder' => 'Search songs, artists, or albums',
                'button' => 'Search',
                'empty' => 'No songs found. Try another keyword.',
                'add' => 'Add to playlist',
                'play' => 'Play now',
                'connect_required' => 'Connect Spotify to search and play songs.',
            ],
            'playlist' => [
                'title' => 'Our shared playlist',
                'create_cta' => 'Create our playlist',
                'empty' => 'Create a shared playlist to start collecting songs together.',
                'tracks_empty' => 'Add songs from the search tab to fill your playlist.',
                'remove' => 'Remove',
                'default_name' => 'Our Love Playlist',
                'default_description' => 'Songs that remind us of each other.',
                'open_in_spotify' => 'Open in Spotify',
                'create_modal' => [
                    'title' => 'Create shared playlist',
                    'name_label' => 'Playlist name',
                    'description_label' => 'Description (optional)',
                    'submit' => 'Create playlist',
                    'name_placeholder' => 'Example: Our Love Playlist',
                    'description_placeholder' => 'Add a short note about the playlist vibe.',
                ],
            ],
            'stats' => [
                'title' => 'Our music stats',
                'top_tracks' => 'Our top songs',
                'top_artists' => 'Our top artists',
                'top_tracks_empty' => 'No top songs yet. Play more music on Spotify to see them here.',
                'top_artists_empty' => 'No top artists yet. Listen together to build this list.',
                'compatibility' => 'Music compatibility',
                'compatibility_description' => ':score% vibe match based on your top tracks and artists.',
                'compatibility_empty' => 'Connect both accounts to calculate your music compatibility.',
            ],
            'compatibility' => [
                'details' => ':tracks track matches · :artists artist matches',
                'badge' => ':score% match',
            ],
            'errors' => [
                'summary_failed' => 'Unable to load Spotify data right now. Try reconnecting and refreshing the page.',
                'connection_required' => 'Connect your Spotify account to continue.',
                'create_playlist_failed' => 'We could not create the playlist. Please try again.',
                'add_failed' => 'Unable to add these songs right now. Try again in a moment.',
                'remove_failed' => 'Unable to remove the track right now. Try again in a moment.',
                'playback_failed' => 'Playback failed. Open Spotify on a device and try again.',
                'playlist_missing' => 'Create your shared playlist before adding songs.',
            ],
        ],
    ],
    'layout' => [
        'navigation' => [
            'dashboard' => 'Dashboard',
            'timeline' => 'Timeline',
            'daily_messages' => 'Daily Message',
            'gallery' => 'Gallery',
            'spotify' => 'Couple Music Space',
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
                    'label' => 'Couple Music Space',
                    'description' => 'Share songs, playlists, and live playback',
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
    'timeline' => [
        'validation' => [
            'max_media' => 'You can upload up to 5 media files per memory.',
        ],
        'flash' => [
            'created' => 'Memory added to the timeline successfully.',
            'updated' => 'Timeline memory updated successfully.',
        ],
    ],
    'docs' => [
        'flash' => [
            'uploaded' => 'Document uploaded successfully.',
            'updated' => 'Document updated successfully.',
            'deleted' => 'Document deleted successfully.',
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
