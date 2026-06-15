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

<style data-cookie-consent>
:root {
    --cc-yellow: #F7D000;
    --cc-yellow-dim: rgba(247, 208, 0, 0.12);
    --cc-dark: #080808;
    --cc-dark-card: #0e0e0e;
    --cc-dark-border: #1a1a1a;
    --cc-gray: #555555;
    --cc-gray-light: #888888;
    --cc-white: #f5f5f5;
}

.cookies {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.cookies[hidden] {
    display: none;
}

.cookies__alert {
    background: var(--cc-dark-card);
    border-top: 1px solid var(--cc-dark-border);
    box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5);
}

.cookies__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 32px;
}

.cookies__wrapper {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
}

.cookies__icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    background: var(--cc-yellow-dim);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cookies__icon svg {
    color: var(--cc-yellow);
}

.cookies__text {
    flex: 1;
    min-width: 280px;
}

.cookies__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--cc-white);
    margin: 0 0 6px 0;
}

.cookies__intro {
    font-size: 14px;
    color: var(--cc-gray-light);
    line-height: 1.5;
}

.cookies__intro p {
    margin: 0;
}

.cookies__intro a {
    color: var(--cc-yellow);
    text-decoration: none;
    transition: opacity 0.2s;
}

.cookies__intro a:hover {
    opacity: 0.8;
}

.cookies__actions {
    display: flex;
    gap: 12px;
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
    padding: 12px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    white-space: nowrap;
}

.cookiesBtn--essentials .cookiesBtn__link {
    background: transparent;
    color: var(--cc-gray-light);
    border: 1px solid var(--cc-dark-border);
}

.cookiesBtn--essentials .cookiesBtn__link:hover {
    color: var(--cc-white);
    border-color: var(--cc-gray);
}

.cookiesBtn--accept .cookiesBtn__link {
    background: var(--cc-yellow);
    color: var(--cc-dark);
    border: 1px solid var(--cc-yellow);
}

.cookiesBtn--accept .cookiesBtn__link:hover {
    background: transparent;
    color: var(--cc-yellow);
}

.cookies__btn--customize {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background: rgba(255,255,255,0.02);
    border: none;
    border-top: 1px solid var(--cc-dark-border);
    color: var(--cc-gray);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
}

.cookies__btn--customize:hover {
    color: var(--cc-white);
    background: rgba(255,255,255,0.04);
}

.cookies__btn--customize svg {
    transition: transform 0.3s ease;
}

.cookies__expandable {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease;
}

.cookies__expandable:target,
.cookies__expandable--open {
    max-height: 600px;
}

.cookies__expandable:target ~ .cookies__btn--customize svg,
.cookies__expandable--open ~ .cookies__btn--customize svg {
    transform: rotate(180deg);
}

.cookies__customize {
    padding: 24px 32px;
    border-top: 1px solid var(--cc-dark-border);
    background: rgba(0,0,0,0.2);
}

.cookies__sections {
    display: grid;
    gap: 16px;
    margin-bottom: 20px;
}

.cookies__section {
    background: var(--cc-dark-card);
    border: 1px solid var(--cc-dark-border);
    padding: 16px;
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: 2px solid var(--cc-gray);
    background: transparent;
    flex-shrink: 0;
    transition: all 0.2s ease;
    position: absolute;
    left: 0;
    top: 0;
}

.cookies__category input[type="checkbox"]:checked + .cookies__box::before {
    background: var(--cc-yellow);
    border-color: var(--cc-yellow);
}

.cookies__category input[type="checkbox"]:checked + .cookies__box::after {
    content: '';
    position: absolute;
    left: 8px;
    top: 4px;
    width: 6px;
    height: 12px;
    border: solid var(--cc-dark);
    border-width: 0 2.5px 2.5px 0;
    transform: rotate(45deg);
}

.cookies__category input[type="checkbox"]:disabled + .cookies__box::before {
    opacity: 0.6;
    cursor: not-allowed;
}

.cookies__category input[type="checkbox"]:not(:disabled):hover + .cookies__box::before {
    border-color: var(--cc-yellow);
}

.cookies__box {
    position: relative;
    padding-left: 34px;
    flex: 1;
    min-width: 200px;
}

.cookies__label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--cc-white);
    margin-bottom: 4px;
}

.cookies__info {
    font-size: 13px;
    color: var(--cc-gray-light);
    line-height: 1.5;
    margin: 0;
    flex-basis: 100%;
    padding-left: 34px;
}

.cookies__details {
    display: inline-block;
    margin-top: 12px;
    margin-left: 34px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--cc-yellow);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: opacity 0.2s;
}

.cookies__details:hover {
    opacity: 0.8;
}

.cookies__definitions {
    list-style: none;
    padding: 16px 0 0 34px;
    margin: 0;
    display: grid;
    gap: 12px;
}

.cookies__cookie {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px 16px;
    padding: 12px;
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--cc-dark-border);
}

.cookies__name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--cc-yellow);
    margin: 0;
}

.cookies__duration {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--cc-gray);
    margin: 0;
    text-align: right;
}

.cookies__description {
    grid-column: 1 / -1;
    font-size: 12px;
    color: var(--cc-gray-light);
    margin: 0;
    line-height: 1.5;
}

.cookies__save {
    display: flex;
    justify-content: flex-end;
}

.cookies__save .cookiesBtn__link {
    background: var(--cc-yellow);
    color: var(--cc-dark);
    border: 1px solid var(--cc-yellow);
}

.cookies__save .cookiesBtn__link:hover {
    background: transparent;
    color: var(--cc-yellow);
}

/* Responsive */
@media (max-width: 768px) {
    .cookies__container {
        padding: 20px 16px;
    }

    .cookies__wrapper {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
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
        padding: 20px 16px;
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
