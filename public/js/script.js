// Common JavaScript - Loaded on every page

console.log("Battle Arena Loaded");

// Smooth scroll for CTA buttons
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add hover effect to cards (if not using CSS-only)
const cards = document.querySelectorAll('.card, .tournament-card');
cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = "translateY(-5px)";
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = "translateY(0)";
    });
});