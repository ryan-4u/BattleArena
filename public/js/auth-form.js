// ── LOGIN VALIDATION ──────────────────────────
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const username = document.getElementById("username");
    if (username.value.trim().length < 3) {
      setError(username, "Username must be at least 3 characters.");
      valid = false;
    } else setOk(username);

    const password = document.getElementById("password");
    if (password.value.length < 6) {
      setError(password, "Password must be at least 6 characters.");
      valid = false;
    } else setOk(password);

    if (valid) loginForm.submit();
  });

  loginForm.querySelectorAll(".form-control").forEach(el => {
    el.addEventListener("input", () => el.classList.remove("is-invalid"));
  });
}

// ── REGISTER VALIDATION ───────────────────────
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const username = document.getElementById("username");
    if (username.value.trim().length < 3) {
      setError(username, "Username must be at least 3 characters.");
      valid = false;
    } else setOk(username);

    const email = document.getElementById("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      setError(email, "Enter a valid email address.");
      valid = false;
    } else setOk(email);

    const password = document.getElementById("password");
    if (password.value.length < 6) {
      setError(password, "Password must be at least 6 characters.");
      valid = false;
    } else setOk(password);

    const role = document.getElementById("role");
    if (!role.value) {
      setError(role, "Please select a role.");
      valid = false;
    } else setOk(role);

    if (valid) registerForm.submit();
  });

  registerForm.querySelectorAll(".form-control, .form-select").forEach(el => {
    el.addEventListener("input", () => el.classList.remove("is-invalid"));
  });
}

// ── HELPERS ───────────────────────────────────
function setError(el, msg) {
  el.classList.add("is-invalid");
  el.classList.remove("is-valid");
  let fb = el.nextElementSibling;
  if (!fb || !fb.classList.contains("invalid-feedback")) {
    fb = document.createElement("div");
    fb.className = "invalid-feedback";
    el.parentNode.insertBefore(fb, el.nextSibling);
  }
  fb.textContent = msg;
}

function setOk(el) {
  el.classList.remove("is-invalid");
  el.classList.add("is-valid");
}