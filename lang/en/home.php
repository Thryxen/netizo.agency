<?php

/*
 * Server-side copy of the English home page (HomeController). Polish twin: lang/pl/home.php (same keys).
 * Ranges keep together: a word joiner (U+2060) after the dash, a no-break space (U+00A0) after the currency.
 */
return [
    'seo' => [
        'title' => 'Websites and Web Apps for Ambitious Companies | Netizo',
        'description' => 'Websites and web applications for businesses, designed and built by a software house from Poland. Modern design, speed and SEO as standard. React, Next.js, Laravel. 150+ projects, 8 years of experience. Free quote!',
        'share_description' => 'Professional websites and web applications. Modern design, speed, SEO. 150+ projects. Free quote!',
        'organization_description' => 'Websites and web applications for businesses, designed and built in Poland. Modern design, speed and SEO as standard. 150+ projects, 8 years of experience.',
        'country' => 'Poland',
        'image' => 'assets/images/og-netizo-en.png',
        'keywords' => [
            'web development', 'website development', 'websites for businesses', 'web design agency',
            'software house', 'software house Poland', 'web development Poland', 'web applications',
            'custom web applications', 'e-commerce development', 'mobile apps', 'nearshore development',
            'React', 'Next.js', 'Node.js', 'Laravel', 'Poland', 'netizo', 'Leszno', 'Poznań', 'Wrocław',
        ],
    ],

    'faq' => [
        [
            'question' => 'How much does a website or an app cost?',
            'answer' => "A simple website usually costs PLN\u{00A0}1,000–\u{2060}5,000, a larger website or a small online store PLN\u{00A0}5,000–\u{2060}15,000, a web application PLN\u{00A0}15,000–\u{2060}50,000, and large systems start at PLN\u{00A0}50,000. The final price depends on the scope, and you get a detailed quote for free after the brief.",
        ],
        [
            'question' => 'How long does it take to build a website or an app?',
            'answer' => "A landing page usually takes 2–\u{2060}3\u{00A0}weeks, a company website 4–\u{2060}6\u{00A0}weeks, and a web application 2–\u{2060}4\u{00A0}months. We set the exact deadline after the brief, once we know the scope of work.",
        ],
        [
            'question' => 'Will my website show up on Google?',
            'answer' => 'Yes. We build every website with search engines in mind: fast loading, a clean heading structure, titles and descriptions for search results, structured data and a sitemap. No one can honestly guarantee a specific position, because it also depends on the competition and the content, but you get a solid foundation for SEO, local search included.',
        ],
        [
            'question' => 'Can I edit the content of the website myself?',
            'answer' => 'Yes. If you want to do it in-house, we add a simple content management system (CMS): you can change texts, images and posts in it, and we show you how to use it. Bigger changes you send to us as tasks in the client portal.',
        ],
        [
            'question' => 'Will you design the website if I don’t have a design?',
            'answer' => 'Yes. We have UI/UX designers on the team: we design the look from scratch or build on your sketches, logo and brand identity. Before we start coding, you get the design and a clickable Figma prototype to review and approve.',
        ],
        [
            'question' => 'Can you refresh my current website instead of building a new one?',
            'answer' => 'Yes. We start by reviewing your current website: what works, what slows it down and what puts customers off. Then we suggest refreshing the design and content, or a rebuild if the old technology holds you back. When we rebuild, we redirect the old URLs to the new ones to limit the risk of losing Google rankings.',
        ],
        [
            'question' => 'Will you take care of the domain, hosting and business email?',
            'answer' => 'Yes. We help you choose and set up the domain, hosting and business email, or we work with what you already have. Your credentials are kept in an encrypted vault in the client portal, and before a domain or hosting renewal is due, you get a reminder there.',
        ],
        [
            'question' => 'Do you look after the website after launch?',
            'answer' => 'Yes. After launch we stay with you: we take care of hosting, security updates, backups, monitoring and further development of the website. You report fixes as tasks in the client portal, and with ongoing cooperation you get a monthly statement with the hours broken down.',
        ],
        [
            'question' => 'Can I follow the progress while you work?',
            'answer' => 'Yes. From day one you have access to the client portal: you see the tasks and the stage of each one, the time spent and the documents, and you chat with the team. Every two weeks we show the progress on a staging version.',
        ],
        [
            'question' => 'Do you work with clients outside Poland?',
            'answer' => 'Yes. We are based in Leszno, in western Poland, and we work with companies from all over the country and from abroad. Most things happen online, over video calls and in the client portal, in Polish or English. If you are near Leszno, we are happy to meet in person.',
        ],
        [
            'question' => 'What technologies do you use?',
            'answer' => 'We choose technologies to fit the project. Most often we work with this stack: front end – React, Next.js, Vue.js and Tailwind CSS; back end – Node.js, Go, Laravel and Python; databases – PostgreSQL, MongoDB and Redis; cloud – AWS, GCP and Vercel.',
        ],
    ],
];
