// Existing login form listener
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Login successful (demo only)");
});

// New: Smooth scroll for CTA button
document.getElementById("cta-btn").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector("#features").scrollIntoView({ behavior: "smooth" });
});

// Optional: Add hover effect for cards (if not using CSS-only)
const cards = document.querySelectorAll(".card");
cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px)";
    });
    card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
    });
});