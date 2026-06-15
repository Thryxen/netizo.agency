<div class="brief-container">
    @if($submitted)
        <!-- Success Screen -->
        <div class="brief-step active">
            <div class="success-screen">
                <div class="success-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                </div>
                <h3>Zapytanie wysłane!</h3>
                <p>Dziękujemy za wypełnienie briefu. Nasz zespół przeanalizuje Twoje wymagania i skontaktuje się w ciągu 24 godzin.</p>
                <div class="success-steps">
                    <div class="success-step">
                        <span class="ss-num">1</span>
                        <div class="ss-content">
                            <strong>Analiza wymagań</strong>
                            <span>Przejrzymy szczegóły projektu</span>
                        </div>
                    </div>
                    <div class="success-step">
                        <span class="ss-num">2</span>
                        <div class="ss-content">
                            <strong>Wstępna wycena</strong>
                            <span>Przygotujemy szacunek kosztów</span>
                        </div>
                    </div>
                    <div class="success-step">
                        <span class="ss-num">3</span>
                        <div class="ss-content">
                            <strong>Konsultacja</strong>
                            <span>Umówimy bezpłatną rozmowę</span>
                        </div>
                    </div>
                </div>
                <button type="button" wire:click="resetForm" class="brief-reset-btn">Wypełnij ponownie</button>
            </div>
        </div>
    @else
        <div class="brief-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: {{ $this->progress }}%"></div>
            </div>
            <div class="progress-info">
                <span class="progress-step">Krok <span>{{ $currentStep }}</span> / <span>{{ $totalSteps }}</span></span>
                <span class="progress-percent">{{ $this->progress }}%</span>
            </div>
        </div>

        <form wire:submit="nextStep">
            <!-- Step 1: Project Type -->
            <div class="brief-step {{ $currentStep === 1 ? 'active' : '' }}">
                <div class="step-head">
                    <span class="step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></span>
                    <h3>Jakiego typu projekt planujesz?</h3>
                    <p>Wybierz wszystkie pasujące opcje</p>
                </div>
                @error('types') <div class="brief-error">{{ $message }}</div> @enderror
                <div class="type-grid">
                    <label class="type-card">
                        <input type="checkbox" wire:model="types" value="website">
                        <div class="type-content">
                            <span class="type-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></span>
                            <span class="type-name">Strona WWW</span>
                            <span class="type-desc">Landing page, firmowa, portfolio</span>
                        </div>
                        <div class="type-check"></div>
                    </label>
                    <label class="type-card">
                        <input type="checkbox" wire:model="types" value="webapp">
                        <div class="type-content">
                            <span class="type-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span>
                            <span class="type-name">Aplikacja Web</span>
                            <span class="type-desc">SaaS, panel, dashboard, CRM</span>
                        </div>
                        <div class="type-check"></div>
                    </label>
                    <label class="type-card">
                        <input type="checkbox" wire:model="types" value="ecommerce">
                        <div class="type-content">
                            <span class="type-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg></span>
                            <span class="type-name">E-commerce</span>
                            <span class="type-desc">Sklep, marketplace, B2B</span>
                        </div>
                        <div class="type-check"></div>
                    </label>
                    <label class="type-card">
                        <input type="checkbox" wire:model="types" value="mobile">
                        <div class="type-content">
                            <span class="type-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg></span>
                            <span class="type-name">Aplikacja Mobilna</span>
                            <span class="type-desc">iOS, Android, cross-platform</span>
                        </div>
                        <div class="type-check"></div>
                    </label>
                    <label class="type-card">
                        <input type="checkbox" wire:model="types" value="redesign">
                        <div class="type-content">
                            <span class="type-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg></span>
                            <span class="type-name">Redesign</span>
                            <span class="type-desc">Modernizacja istniejącego projektu</span>
                        </div>
                        <div class="type-check"></div>
                    </label>
                    <label class="type-card">
                        <input type="checkbox" wire:model="types" value="other">
                        <div class="type-content">
                            <span class="type-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></span>
                            <span class="type-name">Inne</span>
                            <span class="type-desc">API, integracje, automatyzacje</span>
                        </div>
                        <div class="type-check"></div>
                    </label>
                </div>
            </div>

            <!-- Step 2: Features -->
            <div class="brief-step {{ $currentStep === 2 ? 'active' : '' }}">
                <div class="step-head">
                    <span class="step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg></span>
                    <h3>Jakich funkcji potrzebujesz?</h3>
                    <p>Zaznacz wymagane funkcjonalności</p>
                </div>
                <div class="features-sections">
                    <div class="feature-group">
                        <h4>Użytkownicy</h4>
                        <div class="feature-chips">
                            <label class="chip"><input type="checkbox" wire:model="features" value="auth"><span>Logowanie / Rejestracja</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="social"><span>Social login</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="roles"><span>Role i uprawnienia</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="profiles"><span>Profile użytkowników</span></label>
                        </div>
                    </div>
                    <div class="feature-group">
                        <h4>Płatności</h4>
                        <div class="feature-chips">
                            <label class="chip"><input type="checkbox" wire:model="features" value="payments"><span>Płatności online</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="subscriptions"><span>Subskrypcje</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="invoices"><span>Faktury</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="cart"><span>Koszyk</span></label>
                        </div>
                    </div>
                    <div class="feature-group">
                        <h4>Zarządzanie</h4>
                        <div class="feature-chips">
                            <label class="chip"><input type="checkbox" wire:model="features" value="cms"><span>CMS</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="admin"><span>Panel admina</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="analytics"><span>Analityka</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="reports"><span>Raporty</span></label>
                        </div>
                    </div>
                    <div class="feature-group">
                        <h4>Integracje</h4>
                        <div class="feature-chips">
                            <label class="chip"><input type="checkbox" wire:model="features" value="api"><span>API zewnętrzne</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="notifications"><span>Powiadomienia</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="chat"><span>Chat</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="email"><span>Email marketing</span></label>
                        </div>
                    </div>
                    <div class="feature-group">
                        <h4>Dodatkowe</h4>
                        <div class="feature-chips">
                            <label class="chip"><input type="checkbox" wire:model="features" value="booking"><span>Rezerwacje</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="search"><span>Wyszukiwarka</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="multilang"><span>Wielojęzyczność</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="ai"><span>Funkcje AI</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="maps"><span>Mapy</span></label>
                            <label class="chip"><input type="checkbox" wire:model="features" value="upload"><span>Upload plików</span></label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 3: Details -->
            <div class="brief-step {{ $currentStep === 3 ? 'active' : '' }}">
                <div class="step-head">
                    <span class="step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg></span>
                    <h3>Szczegóły projektu</h3>
                    <p>Opowiedz więcej o swoich potrzebach</p>
                </div>
                <div class="details-grid">
                    <div class="detail-field">
                        <label>Branża</label>
                        <select wire:model="industry">
                            <option value="">Wybierz branżę...</option>
                            <option value="ecommerce">E-commerce / Handel</option>
                            <option value="fintech">Fintech / Finanse</option>
                            <option value="healthcare">Healthcare / Medycyna</option>
                            <option value="education">Edukacja / E-learning</option>
                            <option value="realestate">Nieruchomości</option>
                            <option value="travel">Turystyka / HoReCa</option>
                            <option value="logistics">Logistyka / Transport</option>
                            <option value="saas">SaaS / IT</option>
                            <option value="media">Media / Rozrywka</option>
                            <option value="other">Inna</option>
                        </select>
                    </div>
                    <div class="detail-field">
                        <label>Grupa docelowa</label>
                        <select wire:model="audience">
                            <option value="">Wybierz...</option>
                            <option value="b2c">B2C - Klienci indywidualni</option>
                            <option value="b2b">B2B - Firmy</option>
                            <option value="both">B2B + B2C</option>
                            <option value="internal">Użytkownicy wewnętrzni</option>
                        </select>
                    </div>
                    <div class="detail-field full">
                        <label>Czy masz projekt graficzny?</label>
                        <div class="radio-cards">
                            <label class="radio-card">
                                <input type="radio" wire:model="design" value="yes">
                                <div class="radio-content">
                                    <span class="radio-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg></span>
                                    <span class="radio-title">Tak, mam</span>
                                    <span class="radio-desc">Figma / Sketch / XD</span>
                                </div>
                            </label>
                            <label class="radio-card">
                                <input type="radio" wire:model="design" value="partial">
                                <div class="radio-content">
                                    <span class="radio-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
                                    <span class="radio-title">Częściowo</span>
                                    <span class="radio-desc">Szkice / inspiracje</span>
                                </div>
                            </label>
                            <label class="radio-card">
                                <input type="radio" wire:model="design" value="no">
                                <div class="radio-content">
                                    <span class="radio-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></span>
                                    <span class="radio-title">Nie mam</span>
                                    <span class="radio-desc">Potrzebuję projektu</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="detail-field full">
                        <label>Oczekiwany termin</label>
                        <div class="radio-cards">
                            <label class="radio-card">
                                <input type="radio" wire:model="timeline" value="asap">
                                <div class="radio-content">
                                    <span class="radio-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
                                    <span class="radio-title">Pilne</span>
                                    <span class="radio-desc">ASAP</span>
                                </div>
                            </label>
                            <label class="radio-card">
                                <input type="radio" wire:model="timeline" value="1-2">
                                <div class="radio-content">
                                    <span class="radio-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>
                                    <span class="radio-title">1-2 mies.</span>
                                    <span class="radio-desc">Standardowy</span>
                                </div>
                            </label>
                            <label class="radio-card">
                                <input type="radio" wire:model="timeline" value="3-6">
                                <div class="radio-content">
                                    <span class="radio-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
                                    <span class="radio-title">3-6 mies.</span>
                                    <span class="radio-desc">Większy projekt</span>
                                </div>
                            </label>
                            <label class="radio-card">
                                <input type="radio" wire:model="timeline" value="flexible">
                                <div class="radio-content">
                                    <span class="radio-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></span>
                                    <span class="radio-title">Elastyczny</span>
                                    <span class="radio-desc">Do ustalenia</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 4: Tech -->
            <div class="brief-step {{ $currentStep === 4 ? 'active' : '' }}">
                <div class="step-head">
                    <span class="step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
                    <h3>Wymagania techniczne</h3>
                    <p>Opcjonalne preferencje technologiczne</p>
                </div>
                <div class="tech-section">
                    <div class="detail-field full">
                        <label>Preferowane technologie</label>
                        <div class="tech-chips">
                            <label class="tech-chip"><input type="checkbox" wire:model="tech" value="react"><span>React</span></label>
                            <label class="tech-chip"><input type="checkbox" wire:model="tech" value="next"><span>Next.js</span></label>
                            <label class="tech-chip"><input type="checkbox" wire:model="tech" value="vue"><span>Vue.js</span></label>
                            <label class="tech-chip"><input type="checkbox" wire:model="tech" value="node"><span>Node.js</span></label>
                            <label class="tech-chip"><input type="checkbox" wire:model="tech" value="laravel"><span>Laravel</span></label>
                            <label class="tech-chip"><input type="checkbox" wire:model="tech" value="python"><span>Python</span></label>
                            <label class="tech-chip"><input type="checkbox" wire:model="tech" value="wordpress"><span>WordPress</span></label>
                            <label class="tech-chip"><input type="checkbox" wire:model="tech" value="shopify"><span>Shopify</span></label>
                            <label class="tech-chip"><input type="checkbox" wire:model="tech" value="nopreference"><span>Bez preferencji</span></label>
                        </div>
                    </div>
                    <div class="detail-field">
                        <label>Bezpieczeństwo</label>
                        <select wire:model="security">
                            <option value="">Wybierz poziom...</option>
                            <option value="standard">Standardowe (SSL)</option>
                            <option value="high">Wysokie (2FA, szyfrowanie)</option>
                            <option value="enterprise">Enterprise (GDPR, SOC2)</option>
                        </select>
                    </div>
                    <div class="detail-field">
                        <label>Hosting</label>
                        <select wire:model="hosting">
                            <option value="">Wybierz...</option>
                            <option value="help">Potrzebuję pomocy</option>
                            <option value="own">Mam własny</option>
                            <option value="cloud">Cloud (AWS/GCP/Azure)</option>
                        </select>
                    </div>
                    <div class="detail-field full">
                        <label>Integracje zewnętrzne (opcjonalnie)</label>
                        <textarea wire:model="integrations" placeholder="Np. systemy ERP, CRM, bramki płatności, API..."></textarea>
                    </div>
                </div>
            </div>

            <!-- Step 5: Budget -->
            <div class="brief-step {{ $currentStep === 5 ? 'active' : '' }}">
                <div class="step-head">
                    <span class="step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></span>
                    <h3>Budżet i współpraca</h3>
                    <p>Pomoże dopasować zakres projektu</p>
                </div>
                <div class="budget-section">
                    <div class="budget-grid">
                        <label class="budget-card">
                            <input type="radio" wire:model="budget" value="small">
                            <div class="budget-content">
                                <span class="budget-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg></span>
                                <span class="budget-range">1 - 5k PLN</span>
                                <span class="budget-desc">Landing page, strona wizytówka</span>
                            </div>
                        </label>
                        <label class="budget-card">
                            <input type="radio" wire:model="budget" value="medium">
                            <div class="budget-content">
                                <span class="budget-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
                                <span class="budget-range">5 - 15k PLN</span>
                                <span class="budget-desc">Rozbudowana strona, mały sklep</span>
                            </div>
                        </label>
                        <label class="budget-card">
                            <input type="radio" wire:model="budget" value="large">
                            <div class="budget-content">
                                <span class="budget-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></span>
                                <span class="budget-range">15 - 50k PLN</span>
                                <span class="budget-desc">Aplikacja, duży e-commerce</span>
                            </div>
                        </label>
                        <label class="budget-card">
                            <input type="radio" wire:model="budget" value="enterprise">
                            <div class="budget-content">
                                <span class="budget-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg></span>
                                <span class="budget-range">50k+ PLN</span>
                                <span class="budget-desc">System enterprise, platforma</span>
                            </div>
                        </label>
                        <label class="budget-card">
                            <input type="radio" wire:model="budget" value="unknown">
                            <div class="budget-content">
                                <span class="budget-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg></span>
                                <span class="budget-range">Do ustalenia</span>
                                <span class="budget-desc">Chcę poznać wycenę</span>
                            </div>
                        </label>
                    </div>
                    <div class="detail-field full" style="margin-top: 40px;">
                        <label>Model współpracy</label>
                        <div class="radio-cards small">
                            <label class="radio-card">
                                <input type="radio" wire:model="cooperation_model" value="fixed">
                                <div class="radio-content">
                                    <span class="radio-title">Fixed Price</span>
                                    <span class="radio-desc">Stała cena</span>
                                </div>
                            </label>
                            <label class="radio-card">
                                <input type="radio" wire:model="cooperation_model" value="hourly">
                                <div class="radio-content">
                                    <span class="radio-title">Time & Material</span>
                                    <span class="radio-desc">Godzinowo</span>
                                </div>
                            </label>
                            <label class="radio-card">
                                <input type="radio" wire:model="cooperation_model" value="dedicated">
                                <div class="radio-content">
                                    <span class="radio-title">Dedicated Team</span>
                                    <span class="radio-desc">Zespół</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="detail-field full">
                        <label>Dodatkowe informacje (opcjonalnie)</label>
                        <textarea wire:model="notes" placeholder="Opisz swoją wizję, cele biznesowe, pytania..."></textarea>
                    </div>
                </div>
            </div>

            <!-- Step 6: Contact -->
            <div class="brief-step {{ $currentStep === 6 ? 'active' : '' }}">
                <div class="step-head">
                    <span class="step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                    <h3>Dane kontaktowe</h3>
                    <p>Skontaktujemy się w ciągu 24h</p>
                </div>
                <div class="contact-grid">
                    <div class="contact-box">
                        <h4>Twoje dane</h4>
                        <div class="contact-fields">
                            <div class="field">
                                <label>Imię i nazwisko *</label>
                                <input type="text" wire:model="name" placeholder="Jan Kowalski">
                                @error('name') <span class="field-error">{{ $message }}</span> @enderror
                            </div>
                            <div class="field">
                                <label>Email *</label>
                                <input type="email" wire:model="email" placeholder="jan@firma.pl">
                                @error('email') <span class="field-error">{{ $message }}</span> @enderror
                            </div>
                            <div class="field">
                                <label>Telefon</label>
                                <input type="tel" wire:model="phone" placeholder="+48 000 000 000">
                            </div>
                        </div>
                    </div>
                    <div class="contact-box">
                        <h4>Firma (opcjonalnie)</h4>
                        <div class="contact-fields">
                            <div class="field">
                                <label>Nazwa firmy</label>
                                <input type="text" wire:model="company" placeholder="Nazwa firmy">
                            </div>
                            <div class="field">
                                <label>Stanowisko</label>
                                <input type="text" wire:model="position" placeholder="CEO, CTO, PM...">
                            </div>
                            <div class="field">
                                <label>Strona WWW</label>
                                <input type="url" wire:model="website" placeholder="https://...">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="contact-extra">
                    <div class="detail-field">
                        <label>Skąd o nas wiesz?</label>
                        <select wire:model="source">
                            <option value="">Wybierz...</option>
                            <option value="google">Google</option>
                            <option value="social">Social media</option>
                            <option value="referral">Polecenie</option>
                            <option value="clutch">Clutch</option>
                            <option value="other">Inne</option>
                        </select>
                    </div>
                    <div class="detail-field">
                        <label>Preferowany kontakt</label>
                        <div class="pref-chips">
                            <label class="pref-chip"><input type="checkbox" wire:model="contact_pref" value="email"><span>Email</span></label>
                            <label class="pref-chip"><input type="checkbox" wire:model="contact_pref" value="phone"><span>Telefon</span></label>
                            <label class="pref-chip"><input type="checkbox" wire:model="contact_pref" value="video"><span>Video call</span></label>
                        </div>
                    </div>
                </div>
                <div class="consent-field">
                    <label class="consent">
                        <input type="checkbox" wire:model="privacy">
                        <span class="consent-box"></span>
                        <span class="consent-text">Akceptuję <a href="#">politykę prywatności</a> i wyrażam zgodę na kontakt *</span>
                    </label>
                    @error('privacy') <span class="field-error">{{ $message }}</span> @enderror
                </div>
            </div>

            <!-- Navigation -->
            <div class="brief-nav">
                <button type="button" class="brief-back" wire:click="previousStep" @if($currentStep === 1) style="visibility: hidden" @endif>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Wstecz
                </button>
                <button type="submit" class="brief-next" wire:loading.attr="disabled">
                    <span wire:loading.remove>{{ $currentStep === $totalSteps ? 'Wyślij brief' : 'Dalej' }}</span>
                    <span wire:loading>{{ $currentStep === $totalSteps ? 'Wysyłanie...' : 'Ładowanie...' }}</span>
                    <svg wire:loading.remove width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
            </div>
        </form>
    @endif
</div>
