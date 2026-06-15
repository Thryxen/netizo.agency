<div class="newsletter-form-wrap">
    @if($subscribed)
        <div class="newsletter-success">
            <div class="ns-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <path d="M22 4L12 14.01l-3-3"/>
                </svg>
            </div>
            <h4>Subskrypcja potwierdzona!</h4>
            <p>Dziękujemy za zapisanie się do newslettera. Wkrótce otrzymasz pierwszą wiadomość.</p>
        </div>
    @else
        <form wire:submit="subscribe" class="newsletter-form">
            <div class="nf-field">
                <label for="newsletter_email">Email</label>
                <input
                    type="email"
                    id="newsletter_email"
                    wire:model="email"
                    placeholder="twoj@email.pl"
                    class="@error('email') nf-error @enderror"
                >
                @error('email')
                    <span class="nf-error-msg">{{ $message }}</span>
                @enderror
            </div>
            <button type="submit" class="nf-submit" wire:loading.attr="disabled">
                <span wire:loading.remove>Subskrybuj</span>
                <span wire:loading>Zapisuję...</span>
                <svg wire:loading.remove width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <svg wire:loading class="nf-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
            </button>
            <p class="nf-note">Zero spamu. Możesz wypisać się w dowolnym momencie.</p>
        </form>
        <div class="newsletter-stats">
            <div class="ns-item">
                <span class="ns-value">2,500+</span>
                <span class="ns-label">Subskrybentów</span>
            </div>
            <div class="ns-item">
                <span class="ns-value">48%</span>
                <span class="ns-label">Open rate</span>
            </div>
        </div>
    @endif
</div>
