<div x-data x-on:keydown.escape.window="$wire.close()">
    @if($isOpen)
    <div class="modal-overlay" wire:click="close" role="dialog" aria-modal="true" aria-labelledby="callback-modal-title">
        <div class="modal-container" wire:click.stop>
            <button class="modal-close" wire:click="close" aria-label="Zamknij okno">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            @if($submitted)
                <div class="modal-success">
                    <div class="modal-success-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    </div>
                    <h3>Dzięki!</h3>
                    <p>Oddzwonimy najszybciej jak to możliwe.</p>
                    <button type="button" wire:click="close" class="modal-btn">Zamknij</button>
                </div>
            @else
                <div class="modal-header">
                    <div class="modal-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                    </div>
                    <h3 id="callback-modal-title">Masz pytania?</h3>
                    <p>Zostaw numer, oddzwonimy i porozmawiamy o Twoim projekcie.</p>
                </div>

                <form wire:submit="submit" class="modal-form">
                    <div class="modal-field">
                        <label for="callback-phone">Twój numer telefonu</label>
                        <input type="tel" id="callback-phone" wire:model="phone" placeholder="+48 000 000 000" autofocus aria-required="true" aria-describedby="phone-error">
                        @error('phone') <span class="modal-error" id="phone-error" role="alert">{{ $message }}</span> @enderror
                    </div>
                    <button type="submit" class="modal-btn primary" wire:loading.attr="disabled" wire:target="submit">
                        <span wire:loading.remove wire:target="submit">Poproś o kontakt</span>
                        <span wire:loading wire:target="submit">Wysyłanie...</span>
                        <svg wire:loading.remove width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                    </button>
                </form>

                <div class="modal-divider">
                    <span>lub</span>
                </div>

                <a href="tel:+48884343924" class="modal-call">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                    <span>Zadzwoń teraz: <strong>+48 884 343 924</strong></span>
                </a>
            @endif
        </div>
    </div>
    @endif
</div>
