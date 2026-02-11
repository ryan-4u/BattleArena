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

// Existing login form listener
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Login successful (demo only)");
});

// New: Contact form submission
document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value.trim();
    
    if (!name || !email || !subject || !message) {
        alert("Please fill in all fields.");
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }
    
    // Demo submission (replace with actual backend call)
    alert("Thank you for your message! We'll get back to you soon. (Demo only)");
    
    // Reset form
    this.reset();
});