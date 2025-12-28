<?php

return [
    'meta' => [
        'config' => 'Memory Lane Kit',
        'storybook' => 'Storybook',
    ],
    'config' => [
        'heading' => [
            'title' => 'Memory Lane Kit',
            'subtitle' => 'Curate sweet reveals, art, and notes for your shared puzzle adventure.',
        ],
        'flash' => [
            'success' => 'Memory Lane configuration has been saved successfully.',
            'error' => 'Something went wrong while saving your Memory Lane configuration.',
        ],
        'access' => [
            'title' => 'Access PIN',
            'description' => 'Protect the Memory Lane surprise with an optional PIN. Leave it empty to let your partner jump right in.',
            'pin_label' => 'Access PIN (leave empty to disable)',
            'pin_placeholder' => 'Example: 1234',
            'pin_helper' => '4-10 digits or characters. Share it only with the people who should see the surprise.',
            'empty_notice' => 'Memory Lane Kit content has not been configured yet. Visitors will see an empty state until you fill in at least one level.',
            'pin_invalid' => 'The PIN you entered is incorrect.',
        ],
        'levels' => [
            'title' => 'Reveal levels',
            'description' => 'Update imagery and heartfelt copy for every reveal stage. Images will be optimised as .webp files automatically.',
            'image_helper' => 'Drag & drop or choose an image (max. 10 MB, JPG/PNG automatically converted to .webp).',
            'reset' => 'Use default image',
            'remove' => 'Remove image',
            'change' => 'Change image',
            'empty_image' => 'No image yet',
            'fields' => [
                'title' => 'Headline',
                'body' => 'Story snippet',
            ],
        ],
        'actions' => [
            'save' => 'Save changes',
            'saving' => 'Saving…',
            'reset' => 'Reset',
        ],
    ],
    'storybook' => [
        'hero' => [
            'title' => 'Our Memory Storybook',
            'subtitle' => 'Flip through curated memories from the Memory Lane Kit.',
            'cta' => 'Start flipping',
        ],
        'empty' => [
            'title' => 'No scrapbook pages yet',
            'body' => 'Add photos and notes to the Memory Lane Kit to see them bloom into a storybook.',
        ],
        'player' => [
            'next' => 'Next page',
            'previous' => 'Previous page',
        ],
    ],
];
