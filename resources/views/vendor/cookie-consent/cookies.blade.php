<aside id="cookies-policy" class="cookies cookies--no-js" data-text="{{ json_encode(__('cookieConsent::cookies.details')) }}">
    <div class="cookies__alert">
        <div class="cookies__container">
            <div class="cookies__wrapper">
                <div class="cookies__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                        <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
                        <path d="M11 17v.01"/><path d="M7 14v.01"/>
                    </svg>
                </div>
                <div class="cookies__text">
                    <h2 class="cookies__title">@lang('cookieConsent::cookies.title')</h2>
                    <div class="cookies__intro">
                        <p>@lang('cookieConsent::cookies.intro')</p>
                        @if($policy)
                            <p>@lang('cookieConsent::cookies.link', ['url' => $policy])</p>
                        @endif
                    </div>
                </div>
                <div class="cookies__actions">
                    @cookieconsentbutton(action: 'accept.essentials', label: __('cookieConsent::cookies.essentials'), attributes: ['class' => 'cookiesBtn cookiesBtn--essentials'])
                    @cookieconsentbutton(action: 'accept.all', label: __('cookieConsent::cookies.all'), attributes: ['class' => 'cookiesBtn cookiesBtn--accept'])
                </div>
            </div>
        </div>
        <a href="#cookies-policy-customize" class="cookies__btn cookies__btn--customize">
            <span>@lang('cookieConsent::cookies.customize')</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
            </svg>
        </a>
        <div class="cookies__expandable cookies__expandable--custom" id="cookies-policy-customize">
            <form action="{{ route('cookieconsent.accept.configuration') }}" method="post" class="cookies__customize">
                @csrf
                <div class="cookies__sections">
                    @foreach($cookies->getCategories() as $category)
                    <div class="cookies__section">
                        <label for="cookies-policy-check-{{ $category->key() }}" class="cookies__category">
                            @if ($category->key() === 'essentials')
                                <input type="hidden" name="categories[]" value="{{ $category->key() }}" />
                                <input type="checkbox" name="categories[]" value="{{ $category->key() }}" id="cookies-policy-check-{{ $category->key() }}" checked="checked" disabled="disabled" />
                            @else
                                <input type="checkbox" name="categories[]" value="{{ $category->key() }}" id="cookies-policy-check-{{ $category->key() }}" />
                            @endif
                            <span class="cookies__box">
                                <strong class="cookies__label">{{ $category->title }}</strong>
                            </span>
                            @if($category->description)
                                <p class="cookies__info">{{ $category->description }}</p>
                            @endif
                        </label>

                        <div class="cookies__expandable" id="cookies-policy-{{ $category->key() }}">
                            <ul class="cookies__definitions">
                                @foreach($category->getCookies() as $cookie)
                                <li class="cookies__cookie">
                                    <p class="cookies__name">{{ $cookie->name }}</p>
                                    <p class="cookies__duration">{{ Carbon\Carbon::now()->diffForHumans(Carbon\Carbon::now()->addMinutes($cookie->duration), true) }}</p>
                                    @if($cookie->description)
                                        <p class="cookies__description">{{ $cookie->description }}</p>
                                    @endif
                                </li>
                                @endforeach
                            </ul>
                        </div>
                        <a href="#cookies-policy-{{ $category->key() }}" class="cookies__details">@lang('cookieConsent::cookies.details.more')</a>
                    </div>
                    @endforeach
                </div>
                <div class="cookies__save">
                    <button type="submit" class="cookiesBtn__link">@lang('cookieConsent::cookies.save')</button>
                </div>
            </form>
        </div>
    </div>
</aside>

<script data-cookie-consent>
    {!! file_get_contents(LCC_ROOT . '/dist/script.js') !!}
</script>

<script data-cookie-consent>
    {{-- Publish the banner's height as --cookie-banner-height while it shows, so page content, focused controls and the callback button stay above it. --}}
    (function () {
        var banner = document.getElementById('cookies-policy');
        var alert = banner && banner.querySelector('.cookies__alert');
        var root = document.documentElement;

        if (!alert) {
            return;
        }

        var resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(sync) : null;
        var mutationObserver = typeof MutationObserver === 'function' ? new MutationObserver(sync) : null;

        function sync() {
            if (!banner.isConnected || banner.hidden) {
                root.style.removeProperty('--cookie-banner-height');
                resizeObserver && resizeObserver.disconnect();
                mutationObserver && mutationObserver.disconnect();

                return;
            }

            root.style.setProperty('--cookie-banner-height', alert.offsetHeight + 'px');
        }

        resizeObserver && resizeObserver.observe(alert);

        if (mutationObserver && banner.parentNode) {
            mutationObserver.observe(banner.parentNode, { childList: true });
            mutationObserver.observe(banner, { attributes: true, attributeFilter: ['hidden'] });
        }

        sync();
    })();
</script>

<style data-cookie-consent>
/* Uses the site tokens from resources/css/app.css (:root / .dark), so it follows the light/dark theme. */

/* While the banner shows (this style block goes with it), reserve its height so it never hides content or focus. */
html {
    scroll-padding-bottom: var(--cookie-banner-height, 0px);
}

body {
    padding-bottom: var(--cookie-banner-height, 0px);
}

.cookies {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    /* Above the header (40) and callback FAB (30), below Radix dialog/sheet overlays (50) so an open modal is never covered. */
    z-index: 45;
    font-family: inherit;
    color: var(--foreground);
    -webkit-font-smoothing: antialiased;
}

.cookies[hidden] {
    display: none;
}

.cookies__alert {
    max-height: 100vh;
    max-height: 100dvh;
    overflow-y: auto;
    background: var(--background);
    border-top: 1px solid var(--border);
    box-shadow: 0 -12px 32px -16px rgb(0 0 0 / 0.18);
}

.cookies__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 40px;
}

.cookies__wrapper {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.cookies__icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border: 1px solid var(--border);
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cookies__icon svg {
    width: 20px;
    height: 20px;
    color: var(--foreground);
}

.cookies__text {
    flex: 1;
    min-width: 280px;
}

.cookies__title {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: -0.01em;
    color: var(--foreground);
    margin: 0 0 4px 0;
}

.cookies__intro {
    font-size: 14px;
    color: var(--muted-foreground);
    line-height: 1.55;
}

.cookies__intro p {
    margin: 0;
}

.cookies__intro a,
.cookies__details {
    color: var(--foreground);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: var(--border);
    border-radius: 2px;
    transition: text-decoration-color 0.15s ease;
}

.cookies__intro a:hover,
.cookies__details:hover {
    text-decoration-color: currentColor;
}

.cookies__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.cookiesBtn {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
}

.cookiesBtn__link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 16px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    border-radius: calc(var(--radius) - 2px);
    border: 1px solid transparent;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    text-decoration: none;
    white-space: nowrap;
}

.cookiesBtn--essentials .cookiesBtn__link {
    background: var(--background);
    color: var(--foreground);
    border-color: var(--border);
}

.cookiesBtn--essentials .cookiesBtn__link:hover {
    background: var(--muted);
}

.cookiesBtn--accept .cookiesBtn__link,
.cookies__save .cookiesBtn__link {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
}

.cookiesBtn--accept .cookiesBtn__link:hover,
.cookies__save .cookiesBtn__link:hover {
    background: color-mix(in oklab, var(--primary) 90%, transparent);
}

.cookies a:focus-visible,
.cookies button:focus-visible {
    outline: 3px solid color-mix(in oklab, var(--ring) 50%, transparent);
    outline-offset: 2px;
}

.cookies__btn--customize {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 10px;
    background: transparent;
    border: none;
    border-top: 1px solid var(--border);
    color: var(--muted-foreground);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.15s ease, background-color 0.15s ease;
}

.cookies__btn--customize:hover {
    color: var(--foreground);
    background: var(--muted);
}

.cookies__btn--customize svg {
    transition: transform 0.2s ease;
}

/* Collapsed panels are also hidden (not just clipped) so their links and checkboxes leave the tab order. */
.cookies__expandable {
    max-height: 0;
    overflow: hidden;
    visibility: hidden;
    transition: max-height 0.3s ease, visibility 0s linear 0.3s;
}

.cookies__expandable:target,
.cookies__expandable--open {
    max-height: 600px;
    visibility: visible;
    transition-delay: 0s;
}

.cookies__expandable:target ~ .cookies__btn--customize svg,
.cookies__expandable--open ~ .cookies__btn--customize svg {
    transform: rotate(180deg);
}

.cookies__customize {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 40px 24px;
    border-top: 1px solid var(--border);
}

.cookies__sections {
    display: grid;
    gap: 0;
    margin-bottom: 20px;
    border: 1px solid var(--border);
}

.cookies__section {
    background: var(--background);
    padding: 16px;
}

.cookies__section + .cookies__section {
    border-top: 1px solid var(--border);
}

.cookies__category {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    flex-wrap: wrap;
    position: relative;
}

.cookies__category input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.cookies__category input[type="checkbox"] + .cookies__box::before {
    content: '';
    width: 16px;
    height: 16px;
    border: 1px solid var(--input);
    border-radius: 4px;
    background: var(--background);
    box-sizing: border-box;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    position: absolute;
    left: 0;
    top: 2px;
}

.cookies__category input[type="checkbox"]:checked + .cookies__box::before {
    background: var(--primary);
    border-color: var(--primary);
}

.cookies__category input[type="checkbox"]:checked + .cookies__box::after {
    content: '';
    position: absolute;
    left: 5.5px;
    top: 4.5px;
    width: 5px;
    height: 8px;
    border: solid var(--primary-foreground);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.cookies__category input[type="checkbox"]:disabled + .cookies__box::before {
    opacity: 0.5;
    cursor: not-allowed;
}

.cookies__category input[type="checkbox"]:not(:disabled):hover + .cookies__box::before {
    border-color: var(--muted-foreground);
}

.cookies__category input[type="checkbox"]:focus-visible + .cookies__box::before {
    outline: 3px solid color-mix(in oklab, var(--ring) 50%, transparent);
    outline-offset: 2px;
}

.cookies__box {
    position: relative;
    padding-left: 28px;
    flex: 1;
    min-width: 200px;
}

.cookies__label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 2px;
}

.cookies__info {
    font-size: 13px;
    color: var(--muted-foreground);
    line-height: 1.55;
    margin: 0;
    flex-basis: 100%;
    padding-left: 28px;
}

.cookies__details {
    display: inline-block;
    margin-top: 10px;
    margin-left: 28px;
    font-size: 13px;
    font-weight: 500;
}

.cookies__definitions {
    list-style: none;
    padding: 12px 0 0 28px;
    margin: 0;
    display: grid;
    gap: 0;
}

.cookies__cookie {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2px 16px;
    padding: 10px 12px;
    border: 1px solid var(--border);
}

.cookies__cookie + .cookies__cookie {
    border-top: 0;
}

.cookies__name {
    font-size: 13px;
    font-weight: 500;
    color: var(--foreground);
    margin: 0;
    overflow-wrap: anywhere;
}

.cookies__duration {
    font-size: 12px;
    color: var(--muted-foreground);
    margin: 0;
    text-align: right;
}

.cookies__description {
    grid-column: 1 / -1;
    font-size: 12px;
    color: var(--muted-foreground);
    margin: 0;
    line-height: 1.5;
}

.cookies__save {
    display: flex;
    justify-content: flex-end;
}

@media (prefers-reduced-motion: reduce) {
    .cookies *,
    .cookies *::before,
    .cookies *::after {
        transition: none !important;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .cookies__container {
        padding: 16px;
    }

    .cookies__wrapper {
        flex-direction: column;
        align-items: stretch;
        gap: 14px;
    }

    .cookies__icon {
        display: none;
    }

    .cookies__text {
        min-width: auto;
    }

    .cookies__actions {
        flex-direction: column;
    }

    .cookiesBtn__link {
        width: 100%;
    }

    .cookies__customize {
        padding: 16px;
    }

    .cookies__info {
        padding-left: 0;
    }

    .cookies__details {
        margin-left: 0;
    }

    .cookies__definitions {
        padding-left: 0;
    }
}
</style>
