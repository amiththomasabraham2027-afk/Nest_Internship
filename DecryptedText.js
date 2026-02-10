// Decrypted Text Animation
// Converted from React to Vanilla JS

export class DecryptedText {
    constructor(element, options = {}) {
        this.element = element;
        this.originalText = element.textContent;

        this.options = {
            speed: options.speed || 50,
            maxIterations: options.maxIterations || 10,
            sequential: options.sequential !== undefined ? options.sequential : false,
            revealDirection: options.revealDirection || 'start', // 'start', 'end', 'center'
            useOriginalCharsOnly: options.useOriginalCharsOnly || false,
            characters: options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
            animateOn: options.animateOn || 'hover', // 'hover', 'view', 'both'
            onComplete: options.onComplete || null
        };

        this.displayText = this.originalText;
        this.isAnimating = false;
        this.revealedIndices = new Set();
        this.hasAnimated = false;
        this.interval = null;
        this.observer = null;

        this.init();
    }

    init() {
        this.setupElement();

        if (this.options.animateOn === 'hover' || this.options.animateOn === 'both') {
            this.setupHoverListeners();
        }

        if (this.options.animateOn === 'view' || this.options.animateOn === 'both') {
            this.setupScrollObserver();
        }
    }

    setupElement() {
        this.element.style.display = 'inline-block';
        this.element.style.whiteSpace = 'pre-wrap';
        this.render();
    }

    setupHoverListeners() {
        this.element.addEventListener('mouseenter', () => this.startAnimation());
        this.element.addEventListener('mouseleave', () => this.stopAnimation());
    }

    setupScrollObserver() {
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.hasAnimated = true;
                    this.startAnimation();
                }
            });
        };

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver(observerCallback, observerOptions);
        this.observer.observe(this.element);
    }

    getNextIndex(revealedSet) {
        const textLength = this.originalText.length;

        switch (this.options.revealDirection) {
            case 'start':
                return revealedSet.size;

            case 'end':
                return textLength - 1 - revealedSet.size;

            case 'center': {
                const middle = Math.floor(textLength / 2);
                const offset = Math.floor(revealedSet.size / 2);
                const nextIndex = revealedSet.size % 2 === 0
                    ? middle + offset
                    : middle - offset - 1;

                if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
                    return nextIndex;
                }

                for (let i = 0; i < textLength; i++) {
                    if (!revealedSet.has(i)) return i;
                }
                return 0;
            }

            default:
                return revealedSet.size;
        }
    }

    getAvailableChars() {
        if (this.options.useOriginalCharsOnly) {
            return Array.from(new Set(this.originalText.split('')))
                .filter(char => char !== ' ');
        } else {
            return this.options.characters.split('');
        }
    }

    shuffleText(currentRevealed) {
        const availableChars = this.getAvailableChars();

        if (this.options.useOriginalCharsOnly) {
            const positions = this.originalText.split('').map((char, i) => ({
                char,
                isSpace: char === ' ',
                index: i,
                isRevealed: currentRevealed.has(i)
            }));

            const nonSpaceChars = positions
                .filter(p => !p.isSpace && !p.isRevealed)
                .map(p => p.char);

            // Fisher-Yates shuffle
            for (let i = nonSpaceChars.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nonSpaceChars[i], nonSpaceChars[j]] = [nonSpaceChars[j], nonSpaceChars[i]];
            }

            let charIndex = 0;
            return positions.map(p => {
                if (p.isSpace) return ' ';
                if (p.isRevealed) return this.originalText[p.index];
                return nonSpaceChars[charIndex++];
            }).join('');
        } else {
            return this.originalText.split('').map((char, i) => {
                if (char === ' ') return ' ';
                if (currentRevealed.has(i)) return this.originalText[i];
                return availableChars[Math.floor(Math.random() * availableChars.length)];
            }).join('');
        }
    }

    render() {
        this.element.textContent = this.displayText;
    }

    startAnimation() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.revealedIndices = new Set();
        let currentIteration = 0;

        this.interval = setInterval(() => {
            if (this.options.sequential) {
                if (this.revealedIndices.size < this.originalText.length) {
                    const nextIndex = this.getNextIndex(this.revealedIndices);
                    this.revealedIndices.add(nextIndex);
                    this.displayText = this.shuffleText(this.revealedIndices);
                    this.render();
                } else {
                    this.complete();
                }
            } else {
                this.displayText = this.shuffleText(this.revealedIndices);
                this.render();
                currentIteration++;

                if (currentIteration >= this.options.maxIterations) {
                    this.displayText = this.originalText;
                    this.render();
                    this.complete();
                }
            }
        }, this.options.speed);
    }

    stopAnimation() {
        if (this.options.animateOn === 'view') return; // Don't stop if triggered by scroll

        this.complete();
        this.displayText = this.originalText;
        this.revealedIndices = new Set();
        this.render();
    }

    complete() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isAnimating = false;

        if (this.options.onComplete) {
            this.options.onComplete();
        }
    }

    destroy() {
        this.complete();

        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        this.element.textContent = this.originalText;
    }
}
