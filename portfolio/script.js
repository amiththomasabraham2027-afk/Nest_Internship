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
