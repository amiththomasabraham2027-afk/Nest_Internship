// GSAP Scroll Reveal Animation
// Converted from React to Vanilla JS

import gsap from 'https://cdn.skypack.dev/gsap';
import ScrollTrigger from 'https://cdn.skypack.dev/gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollReveal {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            enableBlur: options.enableBlur !== false,
            baseOpacity: options.baseOpacity || 0.1,
            baseRotation: options.baseRotation || 3,
            blurStrength: options.blurStrength || 4,
            rotationEnd: options.rotationEnd || 'bottom bottom',
            wordAnimationEnd: options.wordAnimationEnd || 'bottom bottom',
            scrollContainer: options.scrollContainer || null
        };

        this.wordElements = [];
        this.triggers = [];

        this.init();
    }

    init() {
        // Wait for fonts to load
        if ('fonts' in document) {
            document.fonts.ready.then(() => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.splitIntoWords();
        this.createAnimations();
    }

    splitIntoWords() {
        const text = this.element.textContent;
        this.element.textContent = '';

        // Split by spaces but keep the spaces
        const parts = text.split(/(\s+)/);

        parts.forEach(part => {
            if (part.match(/^\s+$/)) {
                // It's whitespace, add it directly
                this.element.appendChild(document.createTextNode(part));
            } else {
                // It's a word, wrap it in a span
                const wordSpan = document.createElement('span');
                wordSpan.className = 'scroll-word';
                wordSpan.textContent = part;
                this.element.appendChild(wordSpan);
                this.wordElements.push(wordSpan);
            }
        });
    }

    createAnimations() {
        const scroller = this.options.scrollContainer || window;

        // Rotation animation
        const rotationTrigger = gsap.fromTo(
            this.element,
            {
                transformOrigin: '0% 50%',
                rotate: this.options.baseRotation
            },
            {
                ease: 'none',
                rotate: 0,
                scrollTrigger: {
                    trigger: this.element,
                    scroller: scroller,
                    start: 'top bottom',
                    end: this.options.rotationEnd,
                    scrub: true
                }
            }
        );

        this.triggers.push(rotationTrigger.scrollTrigger);

        // Opacity animation
        const opacityTrigger = gsap.fromTo(
            this.wordElements,
            {
                opacity: this.options.baseOpacity,
                willChange: 'opacity'
            },
            {
                ease: 'none',
                opacity: 1,
                stagger: 0.05,
                scrollTrigger: {
                    trigger: this.element,
                    scroller: scroller,
                    start: 'top bottom-=20%',
                    end: this.options.wordAnimationEnd,
                    scrub: true
                }
            }
        );

        this.triggers.push(opacityTrigger.scrollTrigger);

        // Blur animation (if enabled)
        if (this.options.enableBlur) {
            const blurTrigger = gsap.fromTo(
                this.wordElements,
                {
                    filter: `blur(${this.options.blurStrength}px)`
                },
                {
                    ease: 'none',
                    filter: 'blur(0px)',
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: this.element,
                        scroller: scroller,
                        start: 'top bottom-=20%',
                        end: this.options.wordAnimationEnd,
                        scrub: true
                    }
                }
            );

            this.triggers.push(blurTrigger.scrollTrigger);
        }
    }

    destroy() {
        this.triggers.forEach(trigger => {
            if (trigger) trigger.kill();
        });
        this.triggers = [];

        // Restore original text
        const text = this.wordElements.map(w => w.textContent).join(' ');
        this.element.textContent = text;
        this.wordElements = [];
    }
}
