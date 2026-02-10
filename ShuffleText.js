// GSAP Shuffle Text Animation
// Custom implementation without premium SplitText plugin

import gsap from 'https://cdn.skypack.dev/gsap';
import ScrollTrigger from 'https://cdn.skypack.dev/gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ShuffleText {
    constructor(element, options = {}) {
        this.element = element;
        this.originalText = element.textContent;
        this.options = {
            shuffleDirection: options.shuffleDirection || 'right',
            duration: options.duration || 0.4,
            ease: options.ease || 'power3.out',
            threshold: options.threshold || 0.1,
            shuffleTimes: options.shuffleTimes || 2,
            stagger: options.stagger || 0.04,
            animationMode: options.animationMode || 'evenodd',
            triggerOnce: options.triggerOnce !== undefined ? options.triggerOnce : false,
            triggerOnHover: options.triggerOnHover !== undefined ? options.triggerOnHover : true,
            loop: options.loop || false,
            loopDelay: options.loopDelay || 0,
            onComplete: options.onComplete || null
        };

        this.chars = [];
        this.wrappers = [];
        this.timeline = null;
        this.isPlaying = false;
        this.hoverHandler = null;

        this.init();
    }

    init() {
        if ('fonts' in document) {
            document.fonts.ready.then(() => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.element.classList.add('is-ready');
            if (this.options.onComplete) this.options.onComplete();
            return;
        }

        // Add shuffle-parent class for styling
        this.element.classList.add('shuffle-parent');

        this.build();
        this.setupScrollTrigger();
        if (this.options.triggerOnHover) {
            this.setupHover();
        }
    }

    splitIntoChars() {
        const text = this.originalText;
        const chars = [];
        const tempSpan = document.createElement('span');
        tempSpan.style.cssText = 'position: absolute; visibility: hidden; white-space: nowrap;';
        tempSpan.style.font = window.getComputedStyle(this.element).font;
        document.body.appendChild(tempSpan);

        this.element.textContent = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'shuffle-char';
            span.style.display = 'inline-block';

            if (char === ' ') {
                span.style.width = '0.25em';
            }

            this.element.appendChild(span);
            chars.push(span);
        }

        document.body.removeChild(tempSpan);
        return chars;
    }

    build() {
        this.chars = this.splitIntoChars();
        this.wrappers = [];

        const rolls = Math.max(1, Math.floor(this.options.shuffleTimes));
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        const getRandom = () => charset.charAt(Math.floor(Math.random() * charset.length));

        this.chars.forEach(ch => {
            if (ch.textContent === ' ') {
                this.wrappers.push(null);
                return;
            }

            const parent = ch.parentElement;
            if (!parent) return;

            const rect = ch.getBoundingClientRect();
            const w = rect.width || 12;
            const h = rect.height || 20;

            const wrap = document.createElement('span');
            wrap.style.cssText = `
                display: inline-block;
                overflow: hidden;
                width: ${w}px;
                vertical-align: bottom;
                position: relative;
            `;

            const inner = document.createElement('span');
            inner.style.cssText = `
                display: inline-block;
                white-space: nowrap;
                position: relative;
            `;

            parent.insertBefore(wrap, ch);
            wrap.appendChild(inner);

            const originalChar = ch.textContent;

            // Create shuffle sequence
            const sequence = [];

            // Add final character first (for right direction)
            if (this.options.shuffleDirection === 'right') {
                const finalSpan = document.createElement('span');
                finalSpan.textContent = originalChar;
                finalSpan.style.cssText = `
                    display: inline-block;
                    width: ${w}px;
                    text-align: center;
                `;
                finalSpan.setAttribute('data-final', '1');
                sequence.push(finalSpan);
            }

            // Add random characters
            for (let k = 0; k < rolls; k++) {
                const randSpan = document.createElement('span');
                randSpan.textContent = getRandom();
                randSpan.style.cssText = `
                    display: inline-block;
                    width: ${w}px;
                    text-align: center;
                `;
                sequence.push(randSpan);
            }

            // Add final character last (for left direction)
            if (this.options.shuffleDirection === 'left') {
                const finalSpan = document.createElement('span');
                finalSpan.textContent = originalChar;
                finalSpan.style.cssText = `
                    display: inline-block;
                    width: ${w}px;
                    text-align: center;
                `;
                finalSpan.setAttribute('data-final', '1');
                sequence.push(finalSpan);
            }

            sequence.forEach(s => inner.appendChild(s));
            ch.remove();

            const steps = sequence.length - 1;
            const startX = this.options.shuffleDirection === 'right' ? 0 : -steps * w;
            const finalX = this.options.shuffleDirection === 'right' ? -steps * w : 0;

            gsap.set(inner, { x: startX, force3D: true });
            inner.dataset.startX = startX.toString();
            inner.dataset.finalX = finalX.toString();

            this.wrappers.push({ wrap, inner });
        });
    }

    play() {
        if (this.isPlaying) return;

        const strips = this.wrappers.filter(w => w !== null).map(w => w.inner);
        if (!strips.length) return;

        this.isPlaying = true;

        const tl = gsap.timeline({
            repeat: this.options.loop ? -1 : 0,
            repeatDelay: this.options.loop ? this.options.loopDelay : 0,
            onRepeat: () => {
                strips.forEach(strip => {
                    gsap.set(strip, { x: parseFloat(strip.dataset.startX || '0') });
                });
            },
            onComplete: () => {
                this.isPlaying = false;
                this.element.classList.add('is-ready');
                if (this.options.onComplete) {
                    this.options.onComplete();
                }
            }
        });

        const vars = {
            duration: this.options.duration,
            ease: this.options.ease,
            force3D: true,
            x: (i, t) => parseFloat(t.dataset.finalX || '0')
        };

        if (this.options.animationMode === 'evenodd') {
            const odd = strips.filter((_, i) => i % 2 === 1);
            const even = strips.filter((_, i) => i % 2 === 0);
            const oddTotal = this.options.duration + Math.max(0, odd.length - 1) * this.options.stagger;
            const evenStart = odd.length ? oddTotal * 0.7 : 0;

            if (odd.length) {
                tl.to(odd, { ...vars, stagger: this.options.stagger }, 0);
            }
            if (even.length) {
                tl.to(even, { ...vars, stagger: this.options.stagger }, evenStart);
            }
        } else {
            tl.to(strips, { ...vars, stagger: this.options.stagger }, 0);
        }

        this.timeline = tl;
    }

    setupScrollTrigger() {
        ScrollTrigger.create({
            trigger: this.element,
            start: 'top 90%',
            once: this.options.triggerOnce,
            onEnter: () => this.play()
        });
    }

    setupHover() {
        this.hoverHandler = () => {
            if (!this.isPlaying) {
                this.reset();
                this.build();
                this.play();
            }
        };
        this.element.addEventListener('mouseenter', this.hoverHandler);
    }

    reset() {
        if (this.timeline) {
            this.timeline.kill();
            this.timeline = null;
        }

        this.wrappers.forEach(wrapObj => {
            if (!wrapObj) return;
            const { wrap } = wrapObj;
            if (wrap && wrap.parentNode) {
                wrap.remove();
            }
        });

        this.wrappers = [];
        this.element.textContent = this.originalText;
        this.isPlaying = false;
    }

    destroy() {
        if (this.hoverHandler) {
            this.element.removeEventListener('mouseenter', this.hoverHandler);
        }
        this.reset();
    }
}
