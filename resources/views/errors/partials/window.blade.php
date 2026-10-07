{{--
    Browser window on the error stage, in the homepage's live-UI vocabulary: chrome with the requested address over a
    wireframe page, with a chip naming what went wrong. Decorative only (the stage is aria-hidden).

    Parameters: icon (a key of $icons), chipTitle, optional chipDetail and optional scene, the part of the page under
    the chip: 'missing' (an empty image slot, the default), 'locked' (content kept behind the chip), 'form' (an expired
    form), 'requests' (repeated submissions) or 'update' (an empty slot, with a progress line in the chip).
--}}
@php
    $scene ??= 'missing';
    $icon ??= 'file-x';
    $chipDetail ??= null;

    /* The path only (no query string), stripped of control and bidi characters a crafted link could use to fake text. */
    $requestedHost = rescue(fn (): string => request()->getHost(), '', false);
    $requestedPath = rescue(fn (): string => preg_replace('/[\p{Cc}\p{Cf}]/u', '', rawurldecode(request()->getPathInfo())) ?? '/', '/', false);

    /* Lucide paths, drawn at 24×24. */
    $icons = [
        'ban' => '<circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" />',
        'clock' => '<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />',
        'credit-card' => '<rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /><path d="M6 14h2" />',
        'file-x' => '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="m14.5 12.5-5 5" /><path d="m9.5 12.5 5 5" />',
        'hourglass' => '<path d="M5 22h14" /><path d="M5 2h14" /><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" /><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />',
        'lock' => '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />',
        'log-in' => '<path d="m10 17 5-5-5-5" /><path d="M15 12H3" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />',
        'refresh' => '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />',
        'server-crash' => '<path d="M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><path d="M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2" /><path d="M6 6h.01" /><path d="M6 18h.01" /><path d="m13 6-4 6h6l-4 6" />',
    ];
@endphp
<div class="window">
    <div class="window__bar">
        <span class="window__dots"><span></span><span></span><span></span></span>
        <span class="window__address">
            <span class="window__url">{{ $requestedHost }}<span class="window__path">{{ $requestedPath }}</span></span>
        </span>
    </div>
    <div class="window__page">
        <span class="wf-bar wf-bar--short"></span>
        <span class="wf-bar wf-bar--long"></span>
        <div @class(['wf-area', 'wf-slot' => in_array($scene, ['missing', 'locked', 'update'], true)])>
            @switch($scene)
                @case('missing')
                    <svg class="wf-slot__cross" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" focusable="false">
                        <path d="M0 0L100 100M100 0L0 100" stroke-width="1" vector-effect="non-scaling-stroke" />
                    </svg>
                    @break
                @case('locked')
                    <span class="wf-bar"></span>
                    <span class="wf-bar wf-bar--long"></span>
                    <span class="wf-bar"></span>
                    <span class="wf-bar wf-bar--short"></span>
                    @break
                @case('form')
                    <span class="wf-field"></span>
                    <span class="wf-field"></span>
                    <span class="wf-submit"></span>
                    @break
                @case('requests')
                    <span class="wf-request"><span class="wf-bar"></span></span>
                    <span class="wf-request"><span class="wf-bar"></span></span>
                    <span class="wf-request"><span class="wf-bar"></span></span>
                    @break
            @endswitch
            <div class="wf-area__chip">
                <div class="chip">
                    <span class="chip__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false">{!! $icons[$icon] ?? $icons['file-x'] !!}</svg>
                    </span>
                    <span class="chip__text">
                        <span class="chip__title">{{ $chipTitle }}</span>
                        @if ($chipDetail)
                            <span class="chip__detail">{{ $chipDetail }}</span>
                        @endif
                        @if ($scene === 'update')
                            <span class="chip__progress"><span></span></span>
                        @endif
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>
