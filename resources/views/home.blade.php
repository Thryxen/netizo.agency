<!DOCTYPE html>
<html lang="pl">
<head>
    {{-- Trusted Types Policy for XSS Protection --}}
    <script>
        if (window.trustedTypes && trustedTypes.createPolicy) {
            trustedTypes.createPolicy('default', {
                createHTML: (string) => string,
                createScriptURL: (string) => string,
                createScript: (string) => string,
            });
        }
    </script>
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-K8FQP9D5');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFD600">
    <meta name="author" content="Voxbit">

    {!! SEO::generate() !!}

    {{-- FAQ Schema --}}
    <script type="application/ld+json">
        {!! json_encode($faqSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}
    </script>

    <link rel="icon" type="image/png" href="{{ asset('favicon-96x96.png') }}" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}" />
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}" />
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}" />
    <meta name="apple-mobile-web-app-title" content="Voxbit.pl" />
    <link rel="manifest" href="{{ asset('site.webmanifest') }}" />


    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></noscript>

    {{-- Critical CSS inline for faster FCP --}}
    <style>
        :root{--yellow:#F7D000;--dark:#080808;--dark-card:#0e0e0e;--dark-border:#1a1a1a;--gray:#9e9e9e;--gray-light:#c7c7c7;--white:#f5f5f5}
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--dark);color:var(--white);overflow-x:hidden;line-height:1.6}
        .grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(247,208,0,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(247,208,0,.02) 1px,transparent 1px);background-size:80px 80px}
        nav{position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:1000;display:flex;align-items:center;background:rgba(14,14,14,.7);border:1px solid var(--dark-border);backdrop-filter:blur(12px)}
        .hero{min-height:100vh;display:flex;align-items:center;padding:120px 0 80px;position:relative;z-index:2}
        .container{max-width:1400px;margin:0 auto;padding:0 40px;width:100%}
        @media(max-width:768px){nav{top:0;left:0;right:0;transform:none;border-radius:0}.container{padding:0 20px}}
    </style>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @cookieconsentscripts
    @livewireStyles
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K8FQP9D5"
                      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div class="grid-bg"></div>
    <div class="cursor-glow" id="glow"></div>

    <nav>
        <a href="#" class="nav-logo">
            <img src="{{ asset('assets/images/logo.svg') }}" alt="Voxbit" width="100" height="32">
        </a>
        <ul class="nav-links">
            <li><a href="#stack" data-section="01">Usługi</a></li>
            <li><a href="#projekty" data-section="02">Projekty</a></li>
            <li><a href="#misja" data-section="03">Misja</a></li>
            <li><a href="#klienci" data-section="04">Klienci</a></li>
            <li><a href="#process" data-section="05">Proces</a></li>
            <li><a href="#faq" data-section="06">FAQ</a></li>
            <li><a href="#newsletter" data-section="07">Newsletter</a></li>
            <li><a href="#kontakt" data-section="08">Kontakt</a></li>
        </ul>
        <div class="nav-more">
            <button class="nav-more-btn" aria-label="Więcej opcji" aria-expanded="false">
                <span class="nav-dot"></span>
                <span class="nav-dot"></span>
                <span class="nav-dot"></span>
            </button>
            <div class="nav-more-menu">
                <a href="/panel" target="_blank">
                    <span class="nmm-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
                    Panel klienta
                </a>
                <a href="/regulamin">
                    <span class="nmm-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg></span>
                    Regulamin
                </a>
                <a href="/polityka-prywatnosci">
                    <span class="nmm-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                    Polityka prywatności
                </a>
                <a href="/utrzymanie">
                    <span class="nmm-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></span>
                    Utrzymanie
                </a>
            </div>
        </div>
        <div class="nav-social">
            <a href="https://facebook.com/voxbitpl" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://instagram.com/voxbitpl" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://linkedin.com/company/voxbitpl" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://github.com/voxbit-pl" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
        </div>
        <div class="nav-section-indicator">
            <span class="nav-current-num">00</span>
            <span class="nav-separator">/</span>
            <span class="nav-total-num">08</span>
        </div>
        <div class="nav-mobile-right">
            <button class="nav-phone-btn" onclick="Livewire.dispatch('openCallbackModal')" aria-label="Zamów rozmowę telefoniczną">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            </button>
            <button class="nav-menu-btn" id="menuBtn" aria-label="Otwórz menu nawigacji" aria-expanded="false">
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-header">
            <span class="mobile-menu-tag">// Nawigacja</span>
        </div>
        <ul class="mobile-menu-links">
            <li><a href="#stack"><span class="mm-num">01</span><span class="mm-text">Usługi</span></a></li>
            <li><a href="#projekty"><span class="mm-num">02</span><span class="mm-text">Projekty</span></a></li>
            <li><a href="#misja"><span class="mm-num">03</span><span class="mm-text">Misja</span></a></li>
            <li><a href="#klienci"><span class="mm-num">04</span><span class="mm-text">Klienci</span></a></li>
            <li><a href="#process"><span class="mm-num">05</span><span class="mm-text">Proces</span></a></li>
            <li><a href="#faq"><span class="mm-num">06</span><span class="mm-text">FAQ</span></a></li>
            <li><a href="#newsletter"><span class="mm-num">07</span><span class="mm-text">Newsletter</span></a></li>
            <li><a href="#kontakt" class="mobile-cta"><span class="mm-num">08</span><span class="mm-text">Kontakt</span></a></li>
        </ul>
        <div class="mobile-menu-divider"></div>
        <ul class="mobile-menu-links mobile-menu-secondary">
            <li><a href="/panel" target="_blank"><span class="mm-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span><span class="mm-text">Panel klienta</span></a></li>
            <li><a href="/regulamin"><span class="mm-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg></span><span class="mm-text">Regulamin</span></a></li>
            <li><a href="/polityka-prywatnosci"><span class="mm-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span><span class="mm-text">Polityka prywatności</span></a></li>
            <li><a href="/utrzymanie"><span class="mm-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></span><span class="mm-text">Utrzymanie</span></a></li>
        </ul>
        <div class="mobile-menu-footer">
            <div class="mm-footer-line"></div>
            <span>kontakt@voxbit.pl</span>
            <div class="mm-social">
                <a href="https://facebook.com/voxbitpl" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com/voxbitpl" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://linkedin.com/company/voxbitpl" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://github.com/voxbit-pl" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
            </div>
        </div>
    </div>

    <main id="main-content">
    <section class="hero">
        <div class="container">
        <div class="hero-grid">
            <div class="hero-content">
                <div class="hero-badge">
                    <span class="hb-dot"></span>
                    <span class="hb-text">System Status: Ready</span>
                    <span class="hb-version">v2.0</span>
                </div>
                <h1 class="hero-title-new">
                    <span class="hero-main-text">Tworzymy <br><span class="accent">strony WWW</span> dla ambitnych firm.</span>
                </h1>
                <p class="hero-desc-new">Aplikacje webowe, mobilne i systemy enterprise. Od pomysłu do wdrożenia.</p>
                <div class="hero-buttons-new">
                    <a href="#kontakt" class="btn-primary-new">
                        <span>Wycena projektu</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                    <a href="#projekty" class="btn-ghost-new">
                        <span>Realizacje</span>
                    </a>
                </div>
                <div class="hero-stats-row">
                    <div class="hsr-item">
                        <span class="hsr-value">150+</span>
                        <span class="hsr-label">Projektów</span>
                    </div>
                    <div class="hsr-divider"></div>
                    <div class="hsr-item">
                        <span class="hsr-value">8 lat</span>
                        <span class="hsr-label">Doświadczenia</span>
                    </div>
                    <div class="hsr-divider"></div>
                    <div class="hsr-item">
                        <span class="hsr-value">99.9%</span>
                        <span class="hsr-label">Uptime</span>
                    </div>
                </div>
            </div>
            <div class="hero-visual">
                <div class="hv-window">
                    <div class="hv-header">
                        <div class="hv-dots">
                            <span></span><span></span><span></span>
                        </div>
                        <span class="hv-title">terminal</span>
                        <div class="hv-actions">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/></svg>
                        </div>
                    </div>
                    <div class="hv-body">
                        <div class="hv-line">
                            <span class="hv-prompt">~/voxbit</span>
                            <span class="hv-cmd" id="heroCmd"></span>
                            <span class="hv-cursor"></span>
                        </div>
                        <div class="hv-output" id="heroOutput"></div>
                    </div>
                </div>
                <div class="hv-floating hv-float-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>
                    <span>Node.js</span>
                </div>
                <div class="hv-floating hv-float-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/></svg>
                    <span>React</span>
                </div>
                <div class="hv-floating hv-float-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                    <span>Analytics</span>
                </div>
            </div>
        </div>
        </div>
        <div class="hero-scroll">
            <span>Przewiń</span>
            <div class="hs-line">
                <div class="hs-dot"></div>
            </div>
        </div>
    </section>

    <section id="stack">
        <span class="sidebar-num">01</span>
        <span class="sidebar-file">services.ts</span>
        <div class="container">
        <div class="services-intro reveal">
            <div class="services-intro-text">
                <p class="section-tag">// Usługi</p>
                <h2 class="section-title">Kompleksowe rozwiązania <span>software'owe.</span></h2>
                <p class="services-intro-desc">Od koncepcji po wdrożenie. Budujemy skalowalne aplikacje webowe, mobilne i systemy enterprise dostosowane do Twoich potrzeb biznesowych.</p>
            </div>
            <div class="services-stats">
                <div class="services-stat">
                    <p class="services-stat-value">150<span>+</span></p>
                    <p class="services-stat-label">Projektów</p>
                </div>
                <div class="services-stat">
                    <p class="services-stat-value">8<span>lat</span></p>
                    <p class="services-stat-label">Doświadczenia</p>
                </div>
                <div class="services-stat">
                    <p class="services-stat-value">99<span>%</span></p>
                    <p class="services-stat-label">Zadowolonych</p>
                </div>
            </div>
        </div>

        <div class="services-grid reveal">
            <div class="service-card">
                <div class="service-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                </div>
                <h3 class="service-title">Aplikacje webowe</h3>
                <p class="service-desc">Nowoczesne aplikacje SPA i SSR. Od prostych landing page po złożone platformy SaaS z zaawansowaną logiką biznesową.</p>
                <div class="service-tags">
                    <span class="service-tag">React</span>
                    <span class="service-tag">Next.js</span>
                    <span class="service-tag">Vue.js</span>
                    <span class="service-tag">TypeScript</span>
                </div>
            </div>

            <div class="service-card">
                <div class="service-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
                </div>
                <h3 class="service-title">Aplikacje mobilne</h3>
                <p class="service-desc">Natywne i cross-platform aplikacje na iOS i Android. Jeden kod, dwie platformy, pełna wydajność.</p>
                <div class="service-tags">
                    <span class="service-tag">React Native</span>
                    <span class="service-tag">Flutter</span>
                    <span class="service-tag">iOS</span>
                    <span class="service-tag">Android</span>
                </div>
            </div>

            <div class="service-card">
                <div class="service-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3 class="service-title">Systemy backend</h3>
                <p class="service-desc">Skalowalne API i mikroserwisy. Architektura przygotowana na miliony użytkowników i wysokie obciążenia.</p>
                <div class="service-tags">
                    <span class="service-tag">Node.js</span>
                    <span class="service-tag">Python</span>
                    <span class="service-tag">Go</span>
                    <span class="service-tag">GraphQL</span>
                </div>
            </div>

            <div class="service-card">
                <div class="service-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>
                </div>
                <h3 class="service-title">DevOps & Cloud</h3>
                <p class="service-desc">Infrastruktura jako kod, CI/CD, konteneryzacja. Automatyzacja deploymentu i monitoring 24/7.</p>
                <div class="service-tags">
                    <span class="service-tag">AWS</span>
                    <span class="service-tag">Docker</span>
                    <span class="service-tag">Kubernetes</span>
                    <span class="service-tag">Terraform</span>
                </div>
            </div>

            <div class="service-card">
                <div class="service-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <h3 class="service-title">E-commerce</h3>
                <p class="service-desc">Sklepy internetowe i platformy marketplace. Headless commerce, integracje płatności i fulfillment.</p>
                <div class="service-tags">
                    <span class="service-tag">Shopify</span>
                    <span class="service-tag">WooCommerce</span>
                    <span class="service-tag">Stripe</span>
                    <span class="service-tag">Headless</span>
                </div>
            </div>

            <div class="service-card">
                <div class="service-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a4 4 0 014 4c0 1.1-.9 2-2 2h-4a2 2 0 01-2-2 4 4 0 014-4z"/><path d="M8.5 8A6.5 6.5 0 002 14.5V16a2 2 0 002 2h3M15.5 8a6.5 6.5 0 016.5 6.5V16a2 2 0 01-2 2h-3"/><circle cx="12" cy="17" r="3"/></svg>
                </div>
                <h3 class="service-title">AI & Automatyzacja</h3>
                <p class="service-desc">Integracje z AI, chatboty, automatyzacja procesów. Wykorzystaj potencjał sztucznej inteligencji w swoim biznesie.</p>
                <div class="service-tags">
                    <span class="service-tag">OpenAI</span>
                    <span class="service-tag">LangChain</span>
                    <span class="service-tag">RAG</span>
                    <span class="service-tag">Agents</span>
                </div>
            </div>
        </div>
        </div>
    </section>

    <section id="projekty">
        <span class="sidebar-num">02</span>
        <span class="sidebar-file">work.tsx</span>
        <div class="container">
        <div class="projects-header reveal">
            <div>
                <p class="section-tag">// Portfolio</p>
                <h2 class="section-title">Ostatnie <span>wdrożenia.</span></h2>
            </div>
        </div>

        <div class="projects-showcase reveal">
            @forelse($projects as $project)
            <div class="project-item">
                <div class="project-mockup">
                    <div class="project-browser">
                        <div class="project-browser-bar">
                        <div class="project-browser-dots">
                            <span></span><span></span><span></span>
                        </div>
                        <div class="project-browser-url">{{ $project->url }}</div>
                    </div>
                    @php
                        $projectThumb = $project->thumbnail_image
                            ? asset('storage/' . $project->thumbnail_image)
                            : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=85&auto=format&fit=crop';
                    @endphp
                    <img
                        src="{{ $projectThumb }}"
                        srcset="{{ $projectThumb }} 1x, {{ $projectThumb }} 2x"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 880px"
                        alt="{{ $project->title }}"
                        class="project-browser-img"
                        loading="{{ $loop->first ? 'eager' : 'lazy' }}"
                        fetchpriority="{{ $loop->first ? 'high' : 'auto' }}"
                        decoding="async"
                        width="1280"
                        height="800">
                </div>
            </div>
            <div class="project-content">
                    <div class="project-number">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</div>
                    <h3>{{ $project->title }}</h3>
                    <p class="project-category">{{ $project->category }}</p>
                    <p class="project-description">{{ $project->description }}</p>
                    <div class="project-tech">
                        @foreach($project->tech_stack as $tech)
                            <span>{{ $tech }}</span>
                        @endforeach
                    </div>
                    <div class="project-metrics">
                        @foreach($project->metrics as $metric)
                        <div class="project-metric">
                            <span class="project-metric-value">{{ $metric['value'] }}</span>
                            <span class="project-metric-label">{{ $metric['label'] }}</span>
                        </div>
                        @endforeach
                    </div>
                    <button type="button" class="project-link-btn" onclick="Livewire.dispatch('openCaseStudy', { projectSlug: '{{ $project->slug }}' })">Zobacz case study →</button>
                </div>
            </div>
            @empty
            <div class="projects-empty">
                <p>Brak projektow do wyswietlenia. Dodaj projekty w panelu administracyjnym.</p>
            </div>
            @endforelse
        </div>
        </div>
    </section>

    <section id="misja">
        <span class="sidebar-num">03</span>
        <span class="sidebar-file">mission.md</span>
        <div class="container">
        <div class="mission-layout">
            <div class="mission-text reveal">
                <h2><span>Nasza</span> Misja.</h2>
                <p>Budujemy ujednolicony, wysokowydajny toolchain dla Twojego biznesu. Naszą misją jest sprawienie, aby następna generacja produktów cyfrowych była szybsza.</p>
                <div class="mission-highlight">Skupiamy się na architekturze, nie tylko na kodzie.</div>
            </div>
            <div class="terminal-window reveal">
                <div class="terminal-bar">
                    <div class="terminal-dots">
                        <span class="terminal-dot red"></span>
                        <span class="terminal-dot yellow"></span>
                        <span class="terminal-dot green"></span>
                    </div>
                    <span class="terminal-title">bash</span>
                </div>
                <div class="terminal-content">
                    <div class="terminal-line">
                        <span class="terminal-prompt">$</span>
                        <span class="terminal-cmd" id="cmd"></span>
                        <span class="terminal-cursor"></span>
                    </div>
                    <div class="terminal-output">
                        <div class="terminal-shape"></div>
                    </div>
                    <div class="terminal-status">
                        <span>Status:</span>
                        <span>Completed in: 144ms</span>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </section>

    <section id="klienci">
        <span class="sidebar-num">04</span>
        <span class="sidebar-file">stats.json</span>
        <div class="container">
        <div class="clients-header reveal">
            <p class="section-tag">// Klienci</p>
            <h2 class="section-title">Naszym rozwiązaniom ufają <span>liderzy.</span></h2>
        </div>

        <div class="clients-marquee-wrapper reveal">
            <div class="clients-marquee">
                <div class="clients-marquee-track">
                    @if($clients->count() > 0)
                        @foreach($clients as $client)
                        @if($client->url)
                        <a href="{{ $client->url }}" target="_blank" rel="noopener noreferrer" class="client-item">
                            <span class="client-name">{{ $client->name }}</span>
                            <span class="client-arrow">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                            </span>
                        </a>
                        @else
                        <div class="client-item">
                            <span class="client-name">{{ $client->name }}</span>
                        </div>
                        @endif
                        @endforeach
                        @foreach($clients as $client)
                        @if($client->url)
                        <a href="{{ $client->url }}" target="_blank" rel="noopener noreferrer" class="client-item">
                            <span class="client-name">{{ $client->name }}</span>
                            <span class="client-arrow">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                            </span>
                        </a>
                        @else
                        <div class="client-item">
                            <span class="client-name">{{ $client->name }}</span>
                        </div>
                        @endif
                        @endforeach
                    @else
                        <div class="client-item"><span class="client-name">CloudInc</span></div>
                        <div class="client-item"><span class="client-name">PayFlow</span></div>
                        <div class="client-item"><span class="client-name">AlphaLab</span></div>
                        <div class="client-item"><span class="client-name">MetaVerse</span></div>
                        <div class="client-item"><span class="client-name">MicroSys</span></div>
                        <div class="client-item"><span class="client-name">Streamify</span></div>
                        <div class="client-item"><span class="client-name">GoRide</span></div>
                        <div class="client-item"><span class="client-name">Container</span></div>
                        <div class="client-item"><span class="client-name">CloudInc</span></div>
                        <div class="client-item"><span class="client-name">PayFlow</span></div>
                        <div class="client-item"><span class="client-name">AlphaLab</span></div>
                        <div class="client-item"><span class="client-name">MetaVerse</span></div>
                        <div class="client-item"><span class="client-name">MicroSys</span></div>
                        <div class="client-item"><span class="client-name">Streamify</span></div>
                        <div class="client-item"><span class="client-name">GoRide</span></div>
                        <div class="client-item"><span class="client-name">Container</span></div>
                    @endif
                </div>
            </div>
        </div>

        <div class="stats-row reveal">
            <div class="stat-box">
                <span class="stat-file">requests.log</span>
                <p class="stat-number" data-val="30">0</p>
                <p class="stat-text">M+ Zapytań / mies.</p>
            </div>
            <div class="stat-box">
                <span class="stat-file">uptime.log</span>
                <p class="stat-number" data-val="99.99" data-decimal="true">0</p>
                <p class="stat-text">% Uptime</p>
            </div>
            <div class="stat-box">
                <span class="stat-file">codebase.log</span>
                <p class="stat-number" data-val="250">0</p>
                <p class="stat-text">K+ Linii kodu</p>
            </div>
        </div>
        </div>
    </section>

    <section id="process">
        <span class="sidebar-num">05</span>
        <span class="sidebar-file">workflow.ts</span>
        <div class="container">
        <div class="process-intro reveal">
            <div class="section-tag"><span>//</span> Jak działamy</div>
            <h2 class="section-title">Nasz <span>proces.</span></h2>
        </div>

        <div class="process-timeline">
            <div class="pt-line">
                <div class="pt-progress" id="processProgress"></div>
            </div>

            <div class="pt-item pt-right" data-step="1">
                <div class="pt-spacer"></div>
                <div class="pt-dot"><span>01</span></div>
                <div class="pt-content">
                    <div class="pt-badge">Etap 01</div>
                    <h3>Odkrywanie</h3>
                    <p>Poznajemy Twój biznes, analizujemy rynek i konkurencję. Definiujemy cele, wymagania i roadmapę projektu.</p>
                    <div class="pt-tags">
                        <span>Warsztaty</span>
                        <span>Research</span>
                        <span>Strategia</span>
                    </div>
                </div>
            </div>

            <div class="pt-item pt-left" data-step="2">
                <div class="pt-content">
                    <div class="pt-badge">Etap 02</div>
                    <h3>Projektowanie</h3>
                    <p>Tworzymy wireframe'y i interaktywne prototypy. Projektujemy UI/UX zgodny z Twoją marką i potrzebami użytkowników.</p>
                    <div class="pt-tags">
                        <span>Wireframes</span>
                        <span>Prototypy</span>
                        <span>UI/UX</span>
                    </div>
                </div>
                <div class="pt-dot"><span>02</span></div>
                <div class="pt-spacer"></div>
            </div>

            <div class="pt-item pt-right" data-step="3">
                <div class="pt-spacer"></div>
                <div class="pt-dot"><span>03</span></div>
                <div class="pt-content">
                    <div class="pt-badge">Etap 03</div>
                    <h3>Rozwój</h3>
                    <p>Kodujemy w dwutygodniowych sprintach z regularnymi demo. Code review, testy automatyczne i CI/CD pipeline.</p>
                    <div class="pt-tags">
                        <span>Agile</span>
                        <span>CI/CD</span>
                        <span>Testing</span>
                    </div>
                </div>
            </div>

            <div class="pt-item pt-left" data-step="4">
                <div class="pt-content">
                    <div class="pt-badge">Etap 04</div>
                    <h3>Wdrożenie</h3>
                    <p>Wdrażamy na produkcję z pełnym monitoringiem. Zapewniamy wsparcie techniczne i rozwijamy projekt według potrzeb.</p>
                    <div class="pt-tags">
                        <span>Deploy</span>
                        <span>Monitoring</span>
                        <span>Support</span>
                    </div>
                </div>
                <div class="pt-dot"><span>04</span></div>
                <div class="pt-spacer"></div>
            </div>
        </div>
        </div>
    </section>

    <section id="faq">
        <span class="sidebar-num">06</span>
        <span class="sidebar-file">answers.json</span>
        <div class="container">
        <div class="faq-wrapper">
            <div class="faq-header reveal">
                <div class="section-tag"><span>//</span> FAQ</div>
                <h2 class="section-title">Często zadawane <span>pytania.</span></h2>
                <p class="faq-subtitle">Nie znalazłeś odpowiedzi? <a href="#" id="faqContact">Napisz do nas</a></p>
            </div>
            <div class="faq-list reveal">
                <div class="faq-item">
                    <button class="faq-question">
                        <span>Ile kosztuje stworzenie aplikacji webowej?</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Koszt zależy od złożoności projektu. Proste strony zaczynają się od 1-5k PLN, rozbudowane strony i małe sklepy od 5-15k PLN, aplikacje webowe od 15-50k PLN, a systemy enterprise od 50k PLN wzwyż. Każdy projekt wyceniamy indywidualnie po analizie wymagań.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">
                        <span>Jak długo trwa realizacja projektu?</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Landing page to 2-3 tygodnie, strona firmowa 4-6 tygodni, aplikacja webowa 2-4 miesiące. Dokładny czas ustalamy po określeniu zakresu. Pracujemy w metodologii Agile z regularnymi dostawami.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">
                        <span>Czy zapewniacie wsparcie po wdrożeniu?</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Tak, oferujemy pakiety wsparcia SLA z gwarantowanym czasem reakcji. Zajmujemy się hostingiem, aktualizacjami bezpieczeństwa, backupami i rozwojem funkcjonalności. Większość klientów zostaje z nami na stałe.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">
                        <span>Jakie technologie wykorzystujecie?</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Frontend: React, Next.js, Vue.js, Tailwind CSS. Backend: Node.js, Go, Laravel, Python. Bazy danych: PostgreSQL, MongoDB, Redis. Cloud: AWS, GCP, Vercel. Dobieramy stack do potrzeb projektu.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">
                        <span>Czy mogę zobaczyć postępy w trakcie pracy?</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Oczywiście! Pracujemy transparentnie - masz dostęp do repozytorium kodu, środowiska staging i regularnych demo co 1-2 tygodnie. Używamy Slack/Discord do bieżącej komunikacji i Linear do śledzenia zadań.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">
                        <span>Czy pomagacie z designem jeśli go nie mam?</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Tak, mamy w zespole doświadczonych UI/UX designerów. Możemy stworzyć kompletny projekt graficzny od zera lub pracować na Twoich szkicach i wytycznych brandingowych. Design jest zawsze dostarczany w Figmie.</p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </section>

    <section id="newsletter">
        <span class="sidebar-num">07</span>
        <span class="sidebar-file">subscribe.ts</span>
        <div class="container">
        <div class="newsletter-wrapper reveal">
            <div class="newsletter-content">
                <div class="newsletter-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Newsletter
                </div>
                <h2>Bądź na bieżąco z <span>technologią.</span></h2>
                <p>Raz w miesiącu wysyłamy przegląd najważniejszych trendów, case studies i praktycznych porad dla biznesu.</p>
                <ul class="newsletter-perks">
                    <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Trendy technologiczne
                    </li>
                    <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Case studies projektów
                    </li>
                    <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Porady dla startupów
                    </li>
                </ul>
            </div>
            <livewire:newsletter />
        </div>
        </div>
    </section>

    <section id="kontakt">
        <span class="sidebar-num">08</span>
        <span class="sidebar-file">contact.ts</span>
        <div class="container">
        <div class="contact-section">
            <div class="contact-header reveal">
                <div class="section-tag"><span>//</span> Kontakt</div>
                <h2 class="section-title">Rozpocznij <span>współpracę.</span></h2>
                <p class="contact-subtitle">Wybierz sposób kontaktu, który Ci odpowiada.</p>
            </div>

            <div class="contact-tabs reveal">
                <button class="ctab-btn active" data-tab="brief">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                    <span>Wypełnij brief</span>
                    <small>Szczegółowa wycena</small>
                </button>
                <button class="ctab-btn" data-tab="quick">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>Szybki kontakt</span>
                    <small>Napisz wiadomość</small>
                </button>
            </div>

            <div class="contact-content">
                <!-- Brief Tab -->
                <div class="ctab-content active" data-tab="brief">
                    <livewire:brief />
                </div>

                <!-- Quick Contact Tab -->
                <div class="ctab-content" data-tab="quick">
                    <livewire:quick-contact />
                </div>
            </div>
        </div>
        </div>
    </section>

    </main>

    <footer>
        <div class="footer-inner">
            <a href="#" class="footer-brand">
                <img src="{{ asset('assets/images/logo.svg') }}" alt="Voxbit" width="100" height="32">
            </a>
            <div class="footer-social">
                <a href="https://facebook.com/voxbitpl" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com/voxbitpl" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://linkedin.com/company/voxbitpl" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://github.com/voxbit-pl" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
            </div>
            <span class="footer-copy">© {{ \Carbon\Carbon::now()->year }} Voxbit</span>
        </div>
    </footer>

    <!-- Callback Modal -->
    <livewire:callback-modal />

    <!-- Case Study Modal -->
    <livewire:case-study-modal />

    <!-- Floating callback button -->
    <button class="callback-trigger" onclick="Livewire.dispatch('openCallbackModal')" aria-label="Zamów rozmowę telefoniczną">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
    </button>

    @livewireScripts
    @cookieconsentview

    <!-- Microsoft Clarity - loaded last to not block rendering -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "ugpcvis19x");
    </script>
</body>
</html>
