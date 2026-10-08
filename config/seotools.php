<?php

/**
 * @see https://github.com/artesaos/seotools
 */

return [
    'inertia' => env('SEO_TOOLS_INERTIA', false),
    'meta' => [
        /*
         * The default configurations to be used by the meta generator.
         */
        'defaults' => [
            'title' => false,
            'titleBefore' => false,
            'description' => 'Netizo - Software House tworzący nowoczesne aplikacje webowe, mobilne i systemy enterprise. Od pomysłu do wdrożenia. React, Next.js, Node.js, Laravel. 150+ projektów, 8 lat doświadczenia.',
            'separator' => ' | ',
            'keywords' => [
                'software house', 'aplikacje webowe', 'aplikacje mobilne', 'systemy enterprise',
                'React', 'Next.js', 'Node.js', 'Laravel', 'programowanie', 'tworzenie stron',
                'web development', 'mobile development', 'Polska', 'netizo', 'Wielkopolska',
                // Leszno
                'Leszno', 'programista Leszno', 'tworzenie stron Leszno', 'software house Leszno',
                // Duże miasta
                'Poznań', 'programista Poznań', 'tworzenie stron Poznań',
                'Wrocław', 'programista Wrocław', 'tworzenie stron Wrocław',
                'Kalisz', 'programista Kalisz', 'tworzenie stron Kalisz',
                'Głogów', 'programista Głogów', 'tworzenie stron Głogów',
                // Średnie miasta
                'Rawicz', 'programista Rawicz', 'tworzenie stron Rawicz',
                'Kościan', 'programista Kościan', 'tworzenie stron Kościan',
                'Gostyń', 'programista Gostyń', 'tworzenie stron Gostyń',
                'Śrem', 'programista Śrem', 'tworzenie stron Śrem',
                'Góra', 'programista Góra', 'tworzenie stron Góra',
                'Wschowa', 'programista Wschowa', 'tworzenie stron Wschowa',
                // Mniejsze miejscowości
                'Rydzyna', 'programista Rydzyna', 'tworzenie stron Rydzyna',
                'Osieczna', 'programista Osieczna', 'tworzenie stron Osieczna',
                'Bojanowo', 'programista Bojanowo', 'tworzenie stron Bojanowo',
                'Poniec', 'programista Poniec', 'tworzenie stron Poniec',
                'Krobia', 'programista Krobia', 'tworzenie stron Krobia',
                'Jutrosin', 'programista Jutrosin', 'tworzenie stron Jutrosin',
                'Miejska Górka', 'programista Miejska Górka', 'tworzenie stron Miejska Górka',
            ],
            'canonical' => 'full',
            'robots' => 'index, follow',
        ],
        /*
         * Webmaster tags are always added.
         */
        'webmaster_tags' => [
            'google' => null,
            'bing' => null,
            'alexa' => null,
            'pinterest' => null,
            'yandex' => null,
            'norton' => null,
        ],

        'add_notranslate_class' => false,
    ],
    'opengraph' => [
        /*
         * The default configurations to be used by the opengraph generator.
         */
        'defaults' => [
            'title' => 'Netizo | Software House',
            'description' => 'Netizo - Software House tworzący nowoczesne aplikacje webowe, mobilne i systemy enterprise. Od pomysłu do wdrożenia.',
            'url' => null,
            'type' => 'website',
            'site_name' => 'Netizo',
            'images' => [env('APP_URL').'/assets/images/og-netizo.png'],
        ],
    ],
    'twitter' => [
        /*
         * The default values to be used by the twitter cards generator.
         */
        'defaults' => [
            'card' => 'summary_large_image',
            'image' => env('APP_URL').'/assets/images/og-netizo.png',
        ],
    ],
    'json-ld' => [
        /*
         * The default configurations to be used by the json-ld generator.
         */
        'defaults' => [
            'title' => 'Netizo | Software House',
            'description' => 'Netizo - Software House tworzący nowoczesne aplikacje webowe, mobilne i systemy enterprise. Od pomysłu do wdrożenia.',
            'url' => 'full',
            'type' => 'WebPage',
            'images' => [env('APP_URL').'/assets/images/og-netizo.png'],
        ],
    ],
];
