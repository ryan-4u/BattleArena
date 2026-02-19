// Tournaments Page Specific JavaScript

console.log("Tournaments page loaded");

// Confirm before joining
document.querySelectorAll('.join-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if(!confirm("Are you sure you want to join this tournament?")) {
            e.preventDefault();
        }
    });
});

// Confirm before deleting
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if(!confirm("Are you sure you want to delete this tournament? This cannot be undone.")) {
            e.preventDefault();
        }
    });
});