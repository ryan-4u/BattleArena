// ── RULES SYSTEM ──────────────────────────────
const rulesContainer = document.getElementById("rulesContainer");
const addRuleBtn     = document.getElementById("addRuleBtn");

function updateRuleNumbers() {
  const items = rulesContainer.querySelectorAll(".rule-item");
  items.forEach((item, i) => {
    item.querySelector(".rule-number").textContent = String(i + 1).padStart(2, "0") + ".";
    item.querySelector(".remove-rule").style.display = items.length > 1 ? "inline-block" : "none";
  });
}

function focusLastRule() {
  const inputs = rulesContainer.querySelectorAll(".rule-input");
  inputs[inputs.length - 1].focus();
}

function addRule(value = "") {
  const div = document.createElement("div");
  div.className = "rule-item d-flex gap-2 mb-2";
  div.innerHTML = `
    <span class="rule-number cyber-tag-line pt-2">01.</span>
    <input type="text" class="form-control rule-input" placeholder="Add a rule..." value="${value}"/>
    <button type="button" class="btn btn-outline-danger btn-sm remove-rule">
      <i class="bi bi-x"></i>
    </button>
  `;
  div.querySelector(".remove-rule").addEventListener("click", () => {
    div.remove(); updateRuleNumbers();
  });
  div.querySelector(".rule-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addRule(); focusLastRule(); }
  });
  rulesContainer.appendChild(div);
  updateRuleNumbers();
}

if (addRuleBtn) {
  addRuleBtn.addEventListener("click", () => { addRule(); focusLastRule(); });
}

// Wire up existing rule items (handles both new.ejs first item and edit.ejs loaded items)
rulesContainer.querySelectorAll(".rule-item").forEach(item => {
  item.querySelector(".remove-rule").addEventListener("click", () => {
    item.remove(); updateRuleNumbers();
  });
  item.querySelector(".rule-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addRule(); focusLastRule(); }
  });
});
updateRuleNumbers();

// ── VALIDATION ────────────────────────────────
function setError(el, msg) {
  el.classList.add("is-invalid");
  el.classList.remove("is-valid");
  const fb = el.nextElementSibling;
  if (fb && fb.classList.contains("invalid-feedback") && msg) fb.textContent = msg;
}

function setOk(el) {
  el.classList.remove("is-invalid");
  el.classList.add("is-valid");
}

function collectAndValidateRules() {
  const ruleInputs = rulesContainer.querySelectorAll(".rule-input");
  const rulesArray = Array.from(ruleInputs).map(i => i.value.trim()).filter(v => v);
  const rulesError = document.getElementById("rulesError");
  if (rulesArray.length === 0) {
    rulesError.textContent = "Add at least one rule.";
    rulesError.style.display = "block";
    return null;
  }
  rulesError.style.display = "none";
  document.getElementById("rulesHidden").value = rulesArray
    .map((r, i) => `${i + 1}. ${r}`).join("\n");
  return rulesArray;
}

// ── NEW TOURNAMENT FORM ───────────────────────
const newForm = document.getElementById("tournamentForm");
if (newForm) {
  newForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;
    const now = new Date();

    const title = document.getElementById("title");
    if (title.value.trim().length >= 3) setOk(title);
    else { setError(title, "Title must be at least 3 characters."); valid = false; }

    const game = document.getElementById("game");
    if (game.value.trim()) setOk(game);
    else { setError(game, "Please enter the game name."); valid = false; }

    const mode = document.getElementById("mode");
    if (mode.value) setOk(mode);
    else { setError(mode, "Please select a mode."); valid = false; }

    const desc = document.getElementById("description");
    if (desc.value.trim().length >= 10) setOk(desc);
    else { setError(desc, "Description must be at least 10 characters."); valid = false; }

    const maxP  = document.getElementById("maxPlayers");
    const maxPV = parseInt(maxP.value);
    if (maxPV >= 2 && maxPV <= 500) setOk(maxP);
    else { setError(maxP, "Min 2, max 500 players."); valid = false; }

    const fee = document.getElementById("entryFee");
    if (parseInt(fee.value) >= 0) setOk(fee);
    else { setError(fee, "Entry fee cannot be negative."); valid = false; }

    const startDate = document.getElementById("startDate");
    const startVal  = new Date(startDate.value);
    if (!startDate.value || startVal <= now) {
      setError(startDate, "Start date must be in the future."); valid = false;
    } else setOk(startDate);

    const regDeadline = document.getElementById("regDeadline");
    const regVal      = new Date(regDeadline.value);
    if (!regDeadline.value || regVal <= now) {
      setError(regDeadline, "Deadline must be in the future."); valid = false;
    } else if (startDate.value && regVal >= startVal) {
      setError(regDeadline, "Deadline must be before the start date."); valid = false;
    } else setOk(regDeadline);

    if (!collectAndValidateRules()) valid = false;

    if (valid) newForm.submit();
  });

  newForm.querySelectorAll(".form-control, .form-select").forEach(el => {
    el.addEventListener("input", () => el.classList.remove("is-invalid"));
  });
}

// ── EDIT TOURNAMENT FORM ─────────────────────
const editForm = document.getElementById("editForm");
if (editForm) {
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const title = document.getElementById("title");
    if (title.value.trim().length >= 3) setOk(title);
    else { setError(title, "Title must be at least 3 characters."); valid = false; }

    const game = document.getElementById("game");
    if (game.value.trim()) setOk(game);
    else { setError(game, "Please enter the game name."); valid = false; }

    const mode = document.getElementById("mode");
    if (mode.value) setOk(mode);
    else { setError(mode, "Please select a mode."); valid = false; }

    const desc = document.getElementById("description");
    if (desc.value.trim().length >= 10) setOk(desc);
    else { setError(desc, "Description must be at least 10 characters."); valid = false; }

    const maxP  = document.getElementById("maxPlayers");
    const maxPV = parseInt(maxP.value);
    if (maxPV >= 2 && maxPV <= 500) setOk(maxP);
    else { setError(maxP, "Min 2, max 500 players."); valid = false; }

    const fee = document.getElementById("entryFee");
    if (parseInt(fee.value) >= 0) setOk(fee);
    else { setError(fee, "Entry fee cannot be negative."); valid = false; }

    const startDate   = document.getElementById("startDate");
    const regDeadline = document.getElementById("regDeadline");
    const startVal    = new Date(startDate.value);
    const regVal      = new Date(regDeadline.value);

    if (!startDate.value) {
      setError(startDate, "Please set a valid start date."); valid = false;
    } else setOk(startDate);

    if (!regDeadline.value) {
      setError(regDeadline, "Please set a registration deadline."); valid = false;
    } else if (startDate.value && regVal >= startVal) {
      setError(regDeadline, "Deadline must be before the start date."); valid = false;
    } else setOk(regDeadline);

    if (!collectAndValidateRules()) valid = false;

    if (valid) editForm.submit();
  });

  editForm.querySelectorAll(".form-control, .form-select").forEach(el => {
    el.addEventListener("input", () => el.classList.remove("is-invalid"));
  });
}