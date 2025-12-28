<?php

return [
    'meta' => [
        'index' => 'Memory Timeline',
        'create' => 'Add Memory',
        'edit' => 'Edit Memory',
    ],
    'flash' => [
        'created' => 'Timeline has been added!',
        'updated' => 'Timeline has been updated!',
        'deleted' => 'Memory has been deleted successfully.',
    ],
    'create' => [
        'heading' => [
            'title' => 'Add Special Moment',
            'subtitle' => 'Record a cherished memory for :space.',
        ],
        'form' => [
            'title' => [
                'label' => 'Moment Title',
                'placeholder' => 'e.g. Our first anniversary dinner',
            ],
            'date' => [
                'label' => 'Date',
            ],
            'description' => [
                'label' => 'Description',
                'placeholder' => 'Tell the story behind this moment…',
            ],
            'media' => [
                'label' => 'Photos',
                'helper' => 'Upload up to :count photos. Each image will be optimised into .webp format automatically.',
                'button' => 'Choose photos',
                'empty' => 'No photos selected yet.',
                'preview_label' => 'Preview',
            ],
            'actions' => [
                'cancel' => 'Cancel',
                'submit' => 'Save memory',
                'submitting' => 'Saving…',
            ],
        ],
    ],
    'edit' => [
        'heading' => [
            'title' => 'Edit Memory',
            'subtitle' => 'Refresh the details of this special moment.',
            'submit' => 'Update memory',
            'submitting' => 'Updating…',
            'media_label' => 'Add photos',
            'media_button' => 'Add photos',
        ],
    ],
];
