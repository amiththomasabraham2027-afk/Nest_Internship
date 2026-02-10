// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all fade-in-scroll elements
const fadeElements = document.querySelectorAll('.fade-in-scroll');
fadeElements.forEach(el => observer.observe(el));

// Initialize gradient background
console.log('Initializing gradient background...');
const canvas = document.getElementById('gradient-canvas');
if (canvas) {
    console.log('Canvas found, loading GradientBlinds module...');
    import('./GradientBlinds.js')
        .then(module => {
            console.log('GradientBlinds module loaded:', module);
            const { GradientBlinds } = module;
            const gradient = new GradientBlinds({
                gradientColors: ['#FF9FFC', '#5227FF'],
                angle: 0,
                noise: 0.3,
                blindCount: 16,
                blindMinWidth: 60,
                spotlightRadius: 0.5,
                spotlightSoftness: 1,
                spotlightOpacity: 1,
                mouseDampening: 0.15,
                distortAmount: 0,
                shineDirection: 'left',
                mixBlendMode: 'lighten',
                mirrorGradient: false,
                paused: false
            });
            console.log('Gradient background initialized successfully!');
        })
        .catch(err => {
            console.error('Failed to load gradient background:', err);
        });
} else {
    console.error('Canvas element #gradient-canvas not found!');
}

// Initialize Shuffle Text Animation for Name
import('./ShuffleText.js')
    .then(module => {
        const { ShuffleText } = module;

        // Animate each word of the name
        document.querySelectorAll('.shuffle-name').forEach((nameElement, index) => {
            new ShuffleText(nameElement, {
                shuffleDirection: 'right',
                duration: 0.4,
                shuffleTimes: 2,
                ease: 'power3.out',
                stagger: 0.04,
                animationMode: 'evenodd',
                threshold: 0.1,
                triggerOnce: false,
                triggerOnHover: true,
                loop: false
            });
        });

        console.log('Shuffle text animation initialized!');
    })
    .catch(err => {
        console.error('Failed to load shuffle animation:', err);
    });

// Initialize Scroll Reveal Animation
import('./ScrollReveal.js')
    .then(module => {
        const { ScrollReveal } = module;

        // Apply scroll reveal to intro text
        const introText = document.querySelector('p.scroll-reveal');
        if (introText) {
            new ScrollReveal(introText, {
                enableBlur: true,
                baseOpacity: 0.2,
                baseRotation: 2,
                blurStrength: 3,
                rotationEnd: 'bottom bottom',
                wordAnimationEnd: 'bottom bottom'
            });
            console.log('Scroll reveal animation initialized!');
        }
    })
    .catch(err => {
        console.error('Failed to load scroll reveal:', err);
    });
