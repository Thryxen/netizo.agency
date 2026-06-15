import './bootstrap';

// Utility: throttle function for scroll events
const throttle = (fn, wait) => {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
};

// Cursor glow
const glow = document.getElementById('glow');
if (glow) {
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

// Scroll reveal
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

// Stats counter
const statNumbers = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseFloat(el.dataset.val);
            const isDecimal = el.dataset.decimal === 'true';
            let current = 0;
            const step = target / 70;

            const counter = setInterval(() => {
                current += step;
                if (current >= target) {
                    el.textContent = isDecimal ? target.toFixed(2) : target;
                    clearInterval(counter);
                } else {
                    el.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);
                }
            }, 20);

            statsObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => statsObserver.observe(stat));

// Terminal typing
const cmdEl = document.getElementById('cmd');
if (cmdEl) {
    const cmdText = 'npm run build_infrastructure';
    let i = 0;

    setTimeout(() => {
        const typing = setInterval(() => {
            if (i < cmdText.length) {
                cmdEl.textContent += cmdText[i];
                i++;
            } else {
                clearInterval(typing);
            }
        }, 70);
    }, 800);
}

// Nav scroll effect + section indicator
const sectionMap = {
    'stack': '01',
    'projekty': '02',
    'misja': '03',
    'klienci': '04',
    'process': '05',
    'faq': '06',
    'newsletter': '07',
    'contact': '08'
};

const sectionNodes = Array.from(document.querySelectorAll('section[id]'));
let sectionPositions = [];

const calculateSectionPositions = () => {
    sectionPositions = sectionNodes.map(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        return {
            id: section.id,
            start: top,
            end: top + height
        };
    });
};

const handleNavScroll = () => {
    const nav = document.querySelector('nav');
    const currentNumEl = document.querySelector('.nav-current-num');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (nav) {
        if (window.scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    // Update section indicator
    if (currentNumEl) {
        let currentSection = '00';
        const scrollPos = window.scrollY + 200;
        for (const section of sectionPositions) {
            if (scrollPos >= section.start && scrollPos <= section.end) {
                currentSection = sectionMap[section.id] || '00';
                break;
            }
        }

        if (currentNumEl.textContent !== currentSection) {
            currentNumEl.style.transform = 'translateY(-5px)';
            currentNumEl.style.opacity = '0';

            setTimeout(() => {
                currentNumEl.textContent = currentSection;
                currentNumEl.style.transform = 'translateY(5px)';

                setTimeout(() => {
                    currentNumEl.style.transform = 'translateY(0)';
                    currentNumEl.style.opacity = '1';
                }, 50);
            }, 150);
        }

        // Update active nav link
        navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (sectionMap[href] === currentSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
};

const handleScrollRaf = () => requestAnimationFrame(handleNavScroll);
window.addEventListener('scroll', throttle(handleScrollRaf, 16));
window.addEventListener('resize', throttle(calculateSectionPositions, 150));
window.addEventListener('orientationchange', throttle(calculateSectionPositions, 150));
window.addEventListener('load', calculateSectionPositions);

calculateSectionPositions();
handleNavScroll();

// Brief Wizard
const brief = {
    step: 1,
    total: 6,
    data: {},

    init() {
        this.form = document.getElementById('briefForm');
        if (!this.form) return;

        this.btnNext = document.getElementById('btnNext');
        this.btnBack = document.getElementById('btnBack');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        this.stepCurrent = document.getElementById('stepCurrent');
        this.stepTotal = document.getElementById('stepTotal');

        this.stepTotal.textContent = this.total;
        this.btnNext.addEventListener('click', () => this.next());
        this.btnBack.addEventListener('click', () => this.back());
        this.updateUI();
    },

    next() {
        if (this.step === this.total) {
            this.showSummary();
            return;
        }
        if (this.step === 'summary') {
            this.submit();
            return;
        }
        this.collectData();
        this.step++;
        this.updateUI();
        this.scrollToBrief();
    },

    back() {
        if (this.step === 'summary') {
            this.step = this.total;
        } else if (this.step > 1) {
            this.step--;
        }
        this.updateUI();
        this.scrollToBrief();
    },

    scrollToBrief() {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    showSummary() {
        this.collectData();
        this.step = 'summary';
        this.renderSummary();
        this.updateUI();
        this.scrollToBrief();
    },

    submit() {
        this.step = 'success';
        this.updateUI();
        this.scrollToBrief();
        console.log('Brief data:', this.data);
    },

    collectData() {
        const s = this.step;

        if (s === 1) {
            this.data.types = Array.from(this.form.querySelectorAll('input[name="type"]:checked')).map(i => i.closest('.type-card').querySelector('.type-name').textContent);
        }
        if (s === 2) {
            this.data.features = Array.from(this.form.querySelectorAll('input[name="features"]:checked')).map(i => i.closest('.chip').querySelector('span').textContent);
        }
        if (s === 3) {
            const industry = this.form.querySelector('select[name="industry"]');
            const audience = this.form.querySelector('select[name="audience"]');
            const design = this.form.querySelector('input[name="design"]:checked');
            const timeline = this.form.querySelector('input[name="timeline"]:checked');

            this.data.industry = industry?.selectedIndex > 0 ? industry.options[industry.selectedIndex].text : '';
            this.data.audience = audience?.selectedIndex > 0 ? audience.options[audience.selectedIndex].text : '';
            this.data.design = design ? design.closest('.radio-card').querySelector('.radio-title').textContent : '';
            this.data.timeline = timeline ? timeline.closest('.radio-card').querySelector('.radio-title').textContent : '';
        }
        if (s === 4) {
            this.data.tech = Array.from(this.form.querySelectorAll('input[name="tech"]:checked')).map(i => i.closest('.tech-chip').querySelector('span').textContent);
            const security = this.form.querySelector('select[name="security"]');
            const hosting = this.form.querySelector('select[name="hosting"]');
            this.data.security = security?.selectedIndex > 0 ? security.options[security.selectedIndex].text : '';
            this.data.hosting = hosting?.selectedIndex > 0 ? hosting.options[hosting.selectedIndex].text : '';
            this.data.integrations = this.form.querySelector('textarea[name="integrations"]')?.value || '';
        }
        if (s === 5) {
            const budget = this.form.querySelector('input[name="budget"]:checked');
            const model = this.form.querySelector('input[name="model"]:checked');
            this.data.budget = budget ? budget.closest('.budget-card').querySelector('.budget-range').textContent : '';
            this.data.model = model ? model.closest('.radio-card').querySelector('.radio-title').textContent : '';
            this.data.notes = this.form.querySelector('textarea[name="notes"]')?.value || '';
        }
        if (s === 6) {
            this.data.name = this.form.querySelector('input[name="name"]')?.value || '';
            this.data.email = this.form.querySelector('input[name="email"]')?.value || '';
            this.data.phone = this.form.querySelector('input[name="phone"]')?.value || '';
            this.data.company = this.form.querySelector('input[name="company"]')?.value || '';
            this.data.position = this.form.querySelector('input[name="position"]')?.value || '';
            this.data.website = this.form.querySelector('input[name="website"]')?.value || '';
        }
    },

    renderSummary() {
        let html = '';

        if (this.data.types?.length) {
            html += '<div class="summary-section"><h4>Typ projektu</h4><div class="summary-tags">' + this.data.types.map(t => '<span class="summary-tag">' + t + '</span>').join('') + '</div></div>';
        }
        if (this.data.features?.length) {
            html += '<div class="summary-section"><h4>Funkcje</h4><div class="summary-tags">' + this.data.features.map(f => '<span class="summary-tag">' + f + '</span>').join('') + '</div></div>';
        }
        html += '<div class="summary-section"><h4>Szczegóły</h4>' +
            '<div class="summary-row"><span>Branża:</span><span>' + (this.data.industry || '—') + '</span></div>' +
            '<div class="summary-row"><span>Grupa docelowa:</span><span>' + (this.data.audience || '—') + '</span></div>' +
            '<div class="summary-row"><span>Projekt graficzny:</span><span>' + (this.data.design || '—') + '</span></div>' +
            '<div class="summary-row"><span>Termin:</span><span>' + (this.data.timeline || '—') + '</span></div>' +
            '</div>';
        if (this.data.tech?.length || this.data.security || this.data.hosting) {
            html += '<div class="summary-section"><h4>Technologie</h4>' +
                (this.data.tech?.length ? '<div class="summary-row"><span>Stack:</span><span>' + this.data.tech.join(', ') + '</span></div>' : '') +
                '<div class="summary-row"><span>Bezpieczeństwo:</span><span>' + (this.data.security || '—') + '</span></div>' +
                '<div class="summary-row"><span>Hosting:</span><span>' + (this.data.hosting || '—') + '</span></div>' +
                '</div>';
        }
        html += '<div class="summary-section"><h4>Budżet</h4>' +
            '<div class="summary-row"><span>Zakres:</span><span style="color:var(--yellow);font-weight:600">' + (this.data.budget || '—') + '</span></div>' +
            '<div class="summary-row"><span>Model:</span><span>' + (this.data.model || '—') + '</span></div>' +
            '</div>';
        html += '<div class="summary-section"><h4>Kontakt</h4>' +
            '<div class="summary-row"><span>Imię:</span><span>' + (this.data.name || '—') + '</span></div>' +
            '<div class="summary-row"><span>Email:</span><span>' + (this.data.email || '—') + '</span></div>' +
            '<div class="summary-row"><span>Telefon:</span><span>' + (this.data.phone || '—') + '</span></div>' +
            (this.data.company ? '<div class="summary-row"><span>Firma:</span><span>' + this.data.company + '</span></div>' : '') +
            '</div>';

        document.getElementById('summaryContent').innerHTML = html;
    },

    updateUI() {
        this.form.querySelectorAll('.brief-step').forEach(s => s.classList.remove('active'));
        const current = this.form.querySelector('.brief-step[data-step="' + this.step + '"]');
        if (current) current.classList.add('active');

        const percent = this.step === 'summary' || this.step === 'success' ? 100 : Math.round((this.step / this.total) * 100);
        this.progressFill.style.width = percent + '%';
        this.progressPercent.textContent = percent + '%';
        this.stepCurrent.textContent = typeof this.step === 'number' ? this.step : this.total;

        if (this.step === 1 || this.step === 'success') {
            this.btnBack.classList.remove('visible');
        } else {
            this.btnBack.classList.add('visible');
        }

        document.querySelector('.brief-nav').style.display = this.step === 'success' ? 'none' : 'flex';

        if (this.step === 'summary') {
            this.btnNext.innerHTML = 'Wyślij <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
        } else if (this.step === this.total) {
            this.btnNext.innerHTML = 'Podsumowanie <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>';
        } else {
            this.btnNext.innerHTML = 'Dalej <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        }
    }
};

brief.init();

// Contact Tabs
const ctabBtns = document.querySelectorAll('.ctab-btn');
const ctabContents = document.querySelectorAll('.ctab-content');

ctabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        ctabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        ctabContents.forEach(c => c.classList.remove('active'));
        document.querySelector(`.ctab-content[data-tab="${tab}"]`).classList.add('active');
    });
});

// Quick Contact Form
const quickForm = document.getElementById('quickContactForm');
if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(quickForm);
        const data = Object.fromEntries(formData);
        console.log('Quick contact data:', data);

        quickForm.parentElement.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="width: 70px; height: 70px; background: rgba(247, 208, 0, 0.1); border: 1px solid var(--yellow); display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; color: var(--yellow);">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                </div>
                <h4 style="font-size: 22px; margin-bottom: 12px;">Wiadomość wysłana!</h4>
                <p style="font-size: 15px; color: var(--gray-light); line-height: 1.6;">Odpowiemy najszybciej jak to możliwe.</p>
            </div>
        `;
    });
}

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach(i => i.classList.remove('active'));

        // Open clicked if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// FAQ contact link
const faqContact = document.getElementById('faqContact');
if (faqContact) {
    faqContact.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
}

// Hero Terminal Animation
const heroTerminal = {
    commands: [
        { cmd: 'npm run build', delay: 80 },
    ],
    output: [
        '<span class="info">▸ Building project...</span>',
        '<span class="muted">  ✓ Compiling TypeScript</span>',
        '<span class="muted">  ✓ Bundling assets</span>',
        '<span class="muted">  ✓ Optimizing images</span>',
        '<span class="muted">  ✓ Generating sitemap</span>',
        '<span class="success">✓ Build completed in 2.4s</span>',
        '',
        '<span class="info">▸ Deploying to production...</span>',
        '<span class="success">✓ Deployed successfully!</span>',
        '<span class="muted">  → https://your-app.voxbit.pl</span>',
    ],
    init() {
        const cmdEl = document.getElementById('heroCmd');
        const outputEl = document.getElementById('heroOutput');
        if (!cmdEl || !outputEl) return;

        let cmd = this.commands[0].cmd;
        let i = 0;

        // Type command
        const typeCmd = setInterval(() => {
            if (i < cmd.length) {
                cmdEl.textContent += cmd[i];
                i++;
            } else {
                clearInterval(typeCmd);
                setTimeout(() => this.showOutput(outputEl), 500);
            }
        }, this.commands[0].delay);
    },
    showOutput(el) {
        let lineIndex = 0;
        const showLine = setInterval(() => {
            if (lineIndex < this.output.length) {
                el.innerHTML += this.output[lineIndex] + '<br>';
                lineIndex++;
            } else {
                clearInterval(showLine);
            }
        }, 200);
    }
};

heroTerminal.init();

// Process Timeline Animation
const processTimeline = {
    items: document.querySelectorAll('.pt-item'),
    progress: document.getElementById('processProgress'),
    line: document.querySelector('.pt-line'),

    init() {
        if (!this.items.length) return;

        // Intersection Observer for items
        const itemObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.3 });

        this.items.forEach(item => itemObserver.observe(item));

        // Scroll-based progress with throttle to avoid forced reflow
        window.addEventListener('scroll', throttle(() => this.updateProgress(), 16));
        this.updateProgress();
    },

    updateProgress() {
        if (!this.progress || !this.line) return;

        const timeline = document.querySelector('.process-timeline');
        if (!timeline) return;

        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const start = rect.top - windowHeight + 200;
        const end = rect.bottom - windowHeight / 2;
        const total = end - start;
        const current = -start;

        const progress = Math.min(Math.max(current / total, 0), 1);
        this.progress.style.height = `${progress * 100}%`;
    }
};

processTimeline.init();

// Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}
