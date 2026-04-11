// ── LOGIN FORM ─────────────────────────────
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const username = document.getElementById("username");
    if (username.value.trim().length >= 3) {
      setOk(username);
    } else {
      setError(username, "Username must be at least 3 characters.");
      valid = false;
    }

    const password = document.getElementById("password");
    if (password.value.length >= 6) {
      setOk(password);
    } else {
      setError(password, "Password must be at least 6 characters.");
      valid = false;
    }

    if (valid) loginForm.submit();
  });

  loginForm.querySelectorAll(".form-control").forEach(el => {
    el.addEventListener("input", () => el.classList.remove("is-invalid", "is-valid"));
  });
}

// ── REGISTER FORM ──────────────────────────
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const username = document.getElementById("username");
    if (username.value.trim().length >= 3) {
      setOk(username);
    } else {
      setError(username, "Username must be at least 3 characters.");
      valid = false;
    }

    const email = document.getElementById("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email.value.trim())) {
      setOk(email);
    } else {
      setError(email, "Please enter a valid email address.");
      valid = false;
    }

    const password = document.getElementById("password");
    if (password.value.length >= 6) {
      setOk(password);
    } else {
      setError(password, "Password must be at least 6 characters.");
      valid = false;
    }

    if (valid) registerForm.submit();
  });

  registerForm.querySelectorAll(".form-control").forEach(el => {
    el.addEventListener("input", () => el.classList.remove("is-invalid", "is-valid"));
  });
}

// ── HELPERS ────────────────────────────────
function setError(el, msg) {
  el.classList.add("is-invalid");
  el.classList.remove("is-valid");
  const fb = el.nextElementSibling;
  if (fb && fb.classList.contains("invalid-feedback")) fb.textContent = msg;
}

function setOk(el) {
  el.classList.remove("is-invalid");
  el.classList.add("is-valid");
}