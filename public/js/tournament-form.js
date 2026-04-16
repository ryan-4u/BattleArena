// ── Sport category → mode options mapping ──────────────────────────────────────
const modeOptions = {
  "battle-royale": [
    { value: "Solo",  label: "Solo — Every player for themselves" },
    { value: "Duo",   label: "Duo — 2-player pairs" },
    { value: "Squad", label: "Squad — 4-player teams" }
  ],
  "fps-shooter": [
    { value: "Solo",  label: "Solo — Individual deathmatch" },
    { value: "Duo",   label: "Duo — 2v2 matches" },
    { value: "Squad", label: "Squad — Team vs Team" }
  ],
  "chess": [
    { value: "1v1",  label: "1v1 — Single player vs player" },
    { value: "Team", label: "Team — Team chess format" }
  ],
  "badminton": [
    { value: "1v1",  label: "Singles — One player per side" },
    { value: "Duo",  label: "Doubles — Two players per side" },
    { value: "Team", label: "Team — Team event" }
  ],
  "coding": [
    { value: "Individual", label: "Individual — Solo competitor" },
    { value: "Team",       label: "Team — Collaborative coding" }
  ],
  "offline-sport": [
    { value: "Individual", label: "Individual — Solo competitor" },
    { value: "1v1",        label: "1v1 — Head to head" },
    { value: "Team",       label: "Team — Team vs Team" }
  ],
  "other": [
    { value: "Solo",       label: "Solo / Individual" },
    { value: "1v1",        label: "1v1" },
    { value: "Duo",        label: "Duo / Pair" },
    { value: "Team",       label: "Team" }
  ]
};

function updateModeOptions(category, currentMode) {
  const modeSelect = document.getElementById("mode");
  if (!modeSelect) return;
  const options = modeOptions[category] || modeOptions["other"];
  modeSelect.innerHTML = '<option value="">-- Select Format --</option>';
  options.forEach(opt => {
    const el = document.createElement("option");
    el.value = opt.value;
    el.textContent = opt.label;
    if (currentMode && opt.value === currentMode) el.selected = true;
    modeSelect.appendChild(el);
  });
}

// ── Init ───────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("sportCategory");
  const modeSelect     = document.getElementById("mode");

  if (categorySelect) {
    const currentMode = modeSelect ? modeSelect.dataset.currentMode || "" : "";
    updateModeOptions(categorySelect.value, currentMode);
    categorySelect.addEventListener("change", () => updateModeOptions(categorySelect.value, ""));
  }

  // ── Rules builder ────────────────────────────────────────────────────────────
  const container  = document.getElementById("rulesContainer");
  const addBtn     = document.getElementById("addRuleBtn");
  const rulesHidden = document.getElementById("rulesHidden");
  const rulesError  = document.getElementById("rulesError");

  function renumberRules() {
    document.querySelectorAll(".rule-number").forEach((el, i) => {
      el.textContent = String(i + 1).padStart(2, "0") + ".";
    });
    const removeButtons = document.querySelectorAll(".remove-rule");
    removeButtons.forEach(btn => {
      btn.style.display = removeButtons.length <= 1 ? "none" : "";
    });
  }

  function addRule(value = "") {
    const div = document.createElement("div");
    div.className = "rule-item d-flex gap-2 mb-2";
    const count = document.querySelectorAll(".rule-item").length + 1;
    div.innerHTML = `
      <span class="rule-number cyber-tag-line pt-2">${String(count).padStart(2, "0")}.</span>
      <input type="text" class="form-control rule-input" placeholder="Add a rule..." value="${value}"/>
      <button type="button" class="btn btn-outline-danger btn-sm remove-rule">
        <i class="bi bi-x"></i>
      </button>`;
    div.querySelector(".remove-rule").addEventListener("click", () => {
      div.remove();
      renumberRules();
    });
    container.appendChild(div);
    renumberRules();
  }

  if (addBtn) addBtn.addEventListener("click", () => addRule());

  // Wire existing remove buttons
  document.querySelectorAll(".remove-rule").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".rule-item").remove();
      renumberRules();
    });
  });

  // Collect rules on submit
  const form = document.getElementById("tournamentForm") || document.getElementById("editForm");
  if (form) {
    form.addEventListener("submit", e => {
      const inputs = [...document.querySelectorAll(".rule-input")];
      const filled = inputs.filter(i => i.value.trim());
      if (filled.length === 0) {
        e.preventDefault();
        rulesError.textContent = "Add at least one rule.";
        rulesError.style.display = "block";
        return;
      }
      rulesError.style.display = "none";
      rulesHidden.value = filled.map((inp, i) => `${i + 1}. ${inp.value.trim()}`).join("\n");
    });
  }

  renumberRules();
});