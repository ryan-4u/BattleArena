// Login Page Specific JavaScript

console.log("Login page loaded");

document.getElementById("loginForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    
    if (!email || !password) {
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
    console.log("Login submitted:", { email });
    alert("Login submitted (demo only)");
    // this.submit(); // Uncomment to actually submit
});