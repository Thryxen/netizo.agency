<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>429 - Zbyt wiele żądań | Voxbit</title>
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

        * { margin: 0; padding: 0; box-sizing: border-box; }

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

        .error-container { position: relative; z-index: 1; text-align: center; max-width: 600px; }

        .error-code {
            font-family: 'JetBrains Mono', monospace;
            font-size: clamp(120px, 25vw, 200px);
            font-weight: 700;
            color: transparent;
            -webkit-text-stroke: 2px var(--yellow);
            line-height: 1;
            margin-bottom: 20px;
        }

        .error-title { font-size: clamp(24px, 5vw, 36px); font-weight: 600; margin-bottom: 16px; }
        .error-title span { color: var(--yellow); }
        .error-desc { font-size: 16px; color: var(--gray-light); margin-bottom: 40px; line-height: 1.6; }

        .error-terminal {
            background: var(--dark-card);
            border: 1px solid var(--dark-border);
            padding: 20px;
            text-align: left;
            margin-bottom: 40px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
        }

        .terminal-line { display: flex; gap: 10px; margin-bottom: 8px; }
        .terminal-prompt { color: var(--yellow); }
        .terminal-cmd { color: var(--gray-light); }
        .terminal-warning { color: var(--yellow); }

        .btn-ghost {
            display: inline-flex; align-items: center; gap: 10px;
            padding: 16px 32px; background: transparent; border: 1px solid var(--dark-border);
            color: var(--white); text-decoration: none; font-weight: 500; font-size: 14px; transition: all 0.3s ease;
        }
        .btn-ghost:hover { border-color: var(--yellow); color: var(--yellow); }

        .logo { position: absolute; top: 30px; left: 30px; }
        .logo img { height: 28px; }
    </style>
</head>
<body>
    <div class="grid-bg"></div>
    <a href="/" class="logo"><img src="{{ asset('assets/images/logo.svg') }}" alt="Voxbit"></a>

    <div class="error-container">
        <div class="error-code">429</div>
        <h1 class="error-title">Zwolnij <span>troche.</span></h1>
        <p class="error-desc">Wysylasz zbyt wiele zadan. Poczekaj chwile i sprobuj ponownie.</p>

        <div class="error-terminal">
            <div class="terminal-line">
                <span class="terminal-prompt">~/voxbit</span>
                <span class="terminal-cmd">request --status</span>
            </div>
            <div class="terminal-line">
                <span class="terminal-warning">Warning: Rate limit exceeded (429)</span>
            </div>
            <div class="terminal-line">
                <span class="terminal-cmd">Cooldown: 60 seconds</span>
            </div>
        </div>

        <a href="javascript:location.reload()" class="btn-ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            <span>Sprobuj ponownie</span>
        </a>
    </div>
</body>
</html>
