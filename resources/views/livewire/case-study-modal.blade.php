<div x-data x-on:keydown.escape.window="$wire.close()">
    @if($isOpen && $project)
    <div class="cs-overlay" wire:click="close" role="dialog" aria-modal="true" aria-labelledby="cs-modal-title">
        <!-- Close button - outside modal for correct fixed positioning -->
        <button class="cs-close" wire:click.stop="close" aria-label="Zamknij okno (ESC)">
            <span class="cs-close-text" aria-hidden="true">ESC</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div class="cs-modal" wire:click.stop>
            <!-- Giant project number -->
            <div class="cs-giant-number">{{ str_pad($projectPosition, 2, '0', STR_PAD_LEFT) }}</div>

            <!-- Hero section -->
            <header class="cs-hero">
                <div class="cs-hero-content">
                    <div class="cs-tag">
                        <span class="cs-tag-dot"></span>
                        Case Study
                    </div>
                    <h1 class="cs-title" id="cs-modal-title">{{ $project->title }}</h1>
                    <p class="cs-subtitle">{{ $project->category }}</p>

                    <a href="https://{{ $project->url }}" target="_blank" class="cs-live-link">
                        <span class="cs-live-indicator"></span>
                        {{ $project->url }}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                    </a>
                </div>

                <!-- Metrics row -->
                <div class="cs-metrics-row">
                    @foreach($project->metrics as $index => $metric)
                    <div class="cs-metric" style="animation-delay: {{ $index * 0.1 }}s">
                        <span class="cs-metric-value">{{ $metric['value'] }}</span>
                        <span class="cs-metric-label">{{ $metric['label'] }}</span>
                    </div>
                    @if(!$loop->last)
                    <div class="cs-metric-divider"></div>
                    @endif
                    @endforeach
                </div>
            </header>

            <!-- Browser mockup -->
            <section class="cs-browser-section">
                <div class="cs-browser">
                    <div class="cs-browser-header">
                        <div class="cs-browser-controls">
                            <span></span><span></span><span></span>
                        </div>
                        <div class="cs-browser-address">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            {{ $project->url }}
                        </div>
                        <div class="cs-browser-actions">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                        </div>
                    </div>
                    <div class="cs-browser-viewport">
                        @if($project->full_image)
                            <img
                                src="{{ asset('storage/' . $project->full_image) }}"
                                alt="{{ $project->title }}"
                                loading="lazy"
                                decoding="async"
                                fetchpriority="low"
                                sizes="(max-width: 900px) 100vw, 1040px"
                                width="1600"
                                height="1000"
                                class="cs-browser-img">
                        @else
                            <div class="cs-browser-placeholder">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                <span>Screenshot projektu</span>
                            </div>
                        @endif
                    </div>
                </div>
                <div class="cs-browser-shadow"></div>
            </section>

            <!-- Content grid -->
            <section class="cs-content">
                <!-- About -->
                <article class="cs-about">
                    <div class="cs-section-label">
                        <span class="cs-label-line"></span>
                        <span class="cs-label-text">O projekcie</span>
                    </div>
                    <p class="cs-description">{{ $project->full_description }}</p>
                </article>

                <!-- Two columns -->
                <div class="cs-columns">
                    <!-- Challenges -->
                    <div class="cs-column cs-column-challenges">
                        <div class="cs-column-header">
                            <div class="cs-column-icon cs-icon-challenge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            </div>
                            <h3>Wyzwania</h3>
                        </div>
                        <ul class="cs-list">
                            @foreach($project->challenges as $index => $challenge)
                            <li style="animation-delay: {{ $index * 0.05 }}s">
                                <span class="cs-list-marker">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</span>
                                <span class="cs-list-text">{{ $challenge }}</span>
                            </li>
                            @endforeach
                        </ul>
                    </div>

                    <!-- Solutions -->
                    <div class="cs-column cs-column-solutions">
                        <div class="cs-column-header">
                            <div class="cs-column-icon cs-icon-solution">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </div>
                            <h3>Rozwiazania</h3>
                        </div>
                        <ul class="cs-list">
                            @foreach($project->solutions as $index => $solution)
                            <li style="animation-delay: {{ $index * 0.05 + 0.2 }}s">
                                <span class="cs-list-marker">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</span>
                                <span class="cs-list-text">{{ $solution }}</span>
                            </li>
                            @endforeach
                        </ul>
                    </div>
                </div>

                <!-- Tech stack -->
                <div class="cs-tech-section">
                    <div class="cs-section-label">
                        <span class="cs-label-line"></span>
                        <span class="cs-label-text">Stack technologiczny</span>
                    </div>
                    <div class="cs-tech-grid">
                        @foreach($project->tech_stack as $index => $tech)
                        <div class="cs-tech-item" style="animation-delay: {{ $index * 0.05 }}s">
                            <span class="cs-tech-name">{{ $tech }}</span>
                        </div>
                        @endforeach
                    </div>
                </div>
            </section>

            <!-- CTA Footer -->
            <footer class="cs-footer">
                <div class="cs-footer-content">
                    <div class="cs-footer-text">
                        <span class="cs-footer-label">Podoba Ci sie ten projekt?</span>
                        <span class="cs-footer-heading">Zbudujmy cos razem.</span>
                    </div>
                    <a href="#contact" wire:click="close" class="cs-cta-btn">
                        <span>Wyslij zapytanie</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
                </footer>
        </div>
    </div>
    @endif
</div>
