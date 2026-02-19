// Contact Page Specific JavaScript

console.log("Contact page loaded");

document.getElementById("contactForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const subject = document.getElementById("subject")?.value;
    const message = document.getElementById("message")?.value.trim();
    
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
    
    // TODO: Replace with actual backend call
    console.log("Contact form submitted:", { name, email, subject, message });
    alert("Thank you for your message! (Demo only)");
    
    // Reset form
    this.reset();
});