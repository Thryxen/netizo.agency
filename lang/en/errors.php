<?php

/*
 * Copy of the error pages on the English site (any address under /en). Descriptions are raw HTML.
 * Polish twin: lang/pl/errors.php (same keys).
 */
return [
    'skip_link' => 'Skip to content',
    'logo_label' => 'Netizo – home page',
    'home_url' => '/en',
    'nav_label' => 'Page sections',
    'nav' => [
        ['href' => '/en#services', 'label' => 'Services'],
        ['href' => '/en#projects', 'label' => 'Projects'],
        ['href' => '/en#process', 'label' => 'Process'],
        ['href' => '/en#faq', 'label' => 'FAQ'],
        ['href' => '/en#contact', 'label' => 'Contact'],
    ],
    'client_panel' => 'Client portal',
    'new_tab' => ' (opens in a new tab)',
    'error_code' => 'Error :code. ',
    'fallback_description' => 'We couldn’t display this page.',
    'home' => 'Home page',
    'contact' => 'Contact us',
    'contact_url' => '/en#contact',
    'contact_line' => 'You can also email us at :email or call :phone.',
    'rights' => 'All rights reserved.',
    'back_to_form' => 'Back to the form',
    'reload' => 'Reload the page',

    'pages' => [
        '401' => [
            'title' => 'Login required',
            'description' => 'This page is only available after you log in.',
            'chip' => 'Members-only page',
        ],
        '402' => [
            'title' => 'Payment required',
            'description' => 'Access to this page requires payment. If this is a mistake, please contact us.',
            'chip' => 'Paid content',
        ],
        '403' => [
            'title' => 'Access denied',
            'description' => 'You don’t have permission to view this page.',
            'chip' => 'Access blocked',
        ],
        '404' => [
            'title' => 'Page not found',
            'description' => 'The address may have changed or the page may have been removed. Check the address for typos.',
            'chip' => 'Nothing at this address',
        ],
        '419' => [
            'title' => 'Session expired',
            'description' => 'The form was open for too long and expired for security reasons. Open it again and send it once more.',
            'chip' => 'Form expired',
        ],
        '429' => [
            'title' => 'Too many attempts',
            'description' => 'Too many requests were sent in a short time. Wait a minute and try again.',
            'chip' => 'Wait a minute',
        ],
        '4xx' => [
            'title' => 'Couldn’t open the page',
            'description' => 'We can’t handle this request. Check the page address.',
            'chip' => 'Request rejected',
        ],
        '500' => [
            'title' => 'Something went wrong',
            'description' => 'This is an error on our server. Please try again in a few minutes.',
            'chip' => 'Server not responding',
        ],
        '503' => [
            'title' => 'Maintenance in progress',
            'description' => 'We’re updating the site. Please come back in a few minutes.',
            'chip' => 'Update in progress',
        ],
        '5xx' => [
            'title' => 'Something went wrong',
            'description' => 'This is an error on our server. Please try again in a few minutes.',
            'chip' => 'Server not responding',
        ],
    ],
];
