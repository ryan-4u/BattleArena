const counters = document.querySelectorAll("[data-target]");
const speed = 120;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.getAttribute("data-target"));
    if (target === 0) { el.textContent = "0"; return; }
    let count = 0;
    const step = Math.ceil(target / speed);
    const timer = setInterval(() => {
        count += step;
        if (count >= target) { el.textContent = target; clearInterval(timer); }
        else el.textContent = count;
    }, 16);
    observer.unobserve(el);
    });
}, { threshold: 0.3 });

counters.forEach(c => observer.observe(c));