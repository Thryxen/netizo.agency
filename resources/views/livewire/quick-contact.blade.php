<div class="quick-contact">
    <div class="qc-form-wrap">
        @if($submitted)
            <div class="qc-success">
                <div class="qc-success-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                </div>
                <h3>Wiadomość wysłana!</h3>
                <p>Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.</p>
                <button type="button" wire:click="$set('submitted', false)" class="qc-reset-btn">Wyślij kolejną wiadomość</button>
            </div>
        @else
            <form class="qc-form" wire:submit="submit">
                <div class="qc-row">
                    <div class="qc-field">
                        <label>Imię i nazwisko *</label>
                        <input type="text" wire:model="name" placeholder="Jan Kowalski">
                        @error('name') <span class="qc-error">{{ $message }}</span> @enderror
                    </div>
                    <div class="qc-field">
                        <label>Email *</label>
                        <input type="email" wire:model="email" placeholder="jan@firma.pl">
                        @error('email') <span class="qc-error">{{ $message }}</span> @enderror
                    </div>
                </div>
                <div class="qc-field">
                    <label>Temat</label>
                    <select wire:model="subject">
                        <option value="">Wybierz...</option>
                        <option value="project">Nowy projekt</option>
                        <option value="cooperation">Współpraca</option>
                        <option value="career">Kariera</option>
                        <option value="other">Inne</option>
                    </select>
                </div>
                <div class="qc-field">
                    <label>Wiadomość *</label>
                    <textarea wire:model="message" placeholder="W czym możemy pomóc?"></textarea>
                    @error('message') <span class="qc-error">{{ $message }}</span> @enderror
                </div>
                <button type="submit" class="qc-submit" wire:loading.attr="disabled">
                    <span wire:loading.remove>Wyślij wiadomość</span>
                    <span wire:loading>Wysyłanie...</span>
                    <svg wire:loading.remove width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
            </form>
        @endif
    </div>
    <div class="qc-info">
        <h4>Dane kontaktowe</h4>
        <div class="qc-items">
            <a href="mailto:kontakt@voxbit.pl" class="qc-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>kontakt@voxbit.pl</span>
            </a>
            <a href="tel:+48884343924" class="qc-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                <span>+48 884 343 924</span>
            </a>
            <div class="qc-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Leszno, Polska</span>
            </div>
        </div>
        <div class="qc-social">
            <a href="#" aria-label="GitHub"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
            <a href="#" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
            <a href="#" aria-label="Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
        </div>
    </div>
</div>
