<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>404 - Strona nie znaleziona | Voxbit</title>
    <link rel="icon" type="image/png" href="{{ asset('favicon-96x96.png') }}" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}" />
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}" />
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}" />
    <meta name="apple-mobile-web-app-title" content="Voxbit.pl" />
    <link rel="manifest" href="{{ asset('site.webmanifest') }}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --dark: #0a0a0a;
            --dark-card: #0e0e0e;
            --dark-border: rgba(255, 255, 255, 0.08);
            --yellow: #F7D000;
            --white: #ffffff;
            --gray: #888;
            --gray-light: #aaa;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--dark);
            color: var(--white);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }

        .grid-bg {
            position: fixed;
            inset: 0;
            background-image:
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
            background-size: 60px 60px;
            pointer-events: none;
        }

        .error-container {
            position: relative;
            z-index: 1;
            text-align: center;
            max-width: 600px;
        }

        .error-code {
            font-family: 'JetBrains Mono', monospace;
            font-size: clamp(120px, 25vw, 200px);
            font-weight: 700;
            color: transparent;
            -webkit-text-stroke: 2px var(--yellow);
            line-height: 1;
            margin-bottom: 20px;
            animation: glitch 3s infinite;
        }

        @keyframes glitch {
            0%, 90%, 100% { transform: translateX(0); }
            92% { transform: translateX(-5px); }
            94% { transform: translateX(5px); }
            96% { transform: translateX(-3px); }
            98% { transform: translateX(3px); }
        }

        .error-title {
            font-size: clamp(24px, 5vw, 36px);
            font-weight: 600;
            margin-bottom: 16px;
        }

        .error-title span {
            color: var(--yellow);
        }

        .error-desc {
            font-size: 16px;
            color: var(--gray-light);
            margin-bottom: 40px;
            line-height: 1.6;
        }

        .error-terminal {
            background: var(--dark-card);
            border: 1px solid var(--dark-border);
            padding: 20px;
            text-align: left;
            margin-bottom: 40px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
        }

        .terminal-line {
            display: flex;
            gap: 10px;
            margin-bottom: 8px;
        }

        .terminal-prompt {
            color: var(--yellow);
        }

        .terminal-cmd {
            color: var(--gray-light);
        }

        .terminal-error {
            color: #ff6b6b;
        }

        .error-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 16px 32px;
            background: var(--yellow);
            color: #000;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            background: #fff;
            transform: translateY(-2px);
        }

        .btn-ghost {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 16px 32px;
            background: transparent;
            border: 1px solid var(--dark-border);
            color: var(--white);
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .btn-ghost:hover {
            border-color: var(--yellow);
            color: var(--yellow);
        }

        .logo {
            position: absolute;
            top: 30px;
            left: 30px;
        }

        .logo img {
            height: 28px;
        }
    </style>
</head>
<body>
    <div class="grid-bg"></div>

    <a href="/" class="logo">
        <img src="{{ asset('assets/images/logo.svg') }}" alt="Voxbit">
    </a>

    <div class="error-container">
        <div class="error-code">404</div>
        <h1 class="error-title">Strona <span>nie znaleziona.</span></h1>
        <p class="error-desc">Wygląda na to, że ta strona nie istnieje lub została przeniesiona. Sprawdź adres URL lub wróć na stronę główną.</p>

        <div class="error-terminal">
            <div class="terminal-line">
                <span class="terminal-prompt">~/voxbit</span>
                <span class="terminal-cmd">GET {{ request()->path() }}</span>
            </div>
            <div class="terminal-line">
                <span class="terminal-error">Error: Route not found (404)</span>
            </div>
        </div>

        <div class="error-actions">
            <a href="/" class="btn-primary">
                <span>Strona glowna</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="javascript:history.back()" class="btn-ghost">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                <span>Wróć</span>
            </a>
        </div>
    </div>
</body>
</html>
