(() => {
  const CONFIG = {
    OFFICIAL_INVITE: "https://discord.gg/QYZS9zdeMr",
    STAFF_CHANNEL: "#staff-apps",
    // After deploy, add your production host(s), e.g. "v07-staff.vercel.app"
    EXPECTED_HOSTS: ["localhost", "127.0.0.1"],
    ALLOW_VERCEL_APP: true,
  };

  const STEPS = ["Identity", "Experience", "Scenarios", "Fit & agreement"];
  let step = 0;

  const form = document.getElementById("staffForm");
  const steps = [...form.querySelectorAll(".step")];
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const stepLabel = document.getElementById("stepLabel");
  const formStatus = document.getElementById("formStatus");
  const donePanel = document.getElementById("donePanel");
  const doneText = document.getElementById("doneText");
  const bars = [...document.querySelectorAll("[data-step-bar]")];
  const hostVerify = document.getElementById("hostVerify");
  const footMeta = document.getElementById("footMeta");

  function isAllowedHost(host) {
    const h = String(host || "").toLowerCase();
    const allowed = (CONFIG.EXPECTED_HOSTS || []).map((x) => String(x).toLowerCase());
    if (allowed.includes(h)) return true;
    if (CONFIG.ALLOW_VERCEL_APP && h.endsWith(".vercel.app")) return true;
    return false;
  }

  function verifyHost() {
    const host = location.hostname || "(local file)";
    const invite = CONFIG.OFFICIAL_INVITE || "";
    const channel = CONFIG.STAFF_CHANNEL || "#staff-apps";

    if (location.protocol === "file:") {
      hostVerify.textContent =
        "Local file — use the Vercel URL for real applications.";
      hostVerify.dataset.bad = "0";
    } else if (isAllowedHost(host)) {
      hostVerify.innerHTML = `You’re on <strong>${host}</strong> — official Vortex07 staff form. Only trust links from <strong>${channel}</strong>${
        invite
          ? ` · <a href="${invite}" target="_blank" rel="noopener noreferrer">Discord server</a>`
          : ""
      }.`;
      hostVerify.dataset.bad = "0";
    } else {
      hostVerify.innerHTML = `⚠ This page is on <strong>${host}</strong>, which isn’t on the official host list. Ask staff in ${channel} for the real link.`;
      hostVerify.dataset.bad = "1";
    }

    if (footMeta && invite) {
      footMeta.innerHTML = `Never enter passwords or tokens · <a href="${invite}" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Official Discord</a>`;
    }
  }

  verifyHost();

  const params = new URLSearchParams(location.search);
  const setupPanel = document.getElementById("setupPanel");
  if (params.get("owner") === "1" && setupPanel) {
    setupPanel.hidden = false;
    setupPanel.open = true;
  }

  function showStep(n) {
    step = n;
    steps.forEach((el, i) => el.classList.toggle("active", i === n));
    bars.forEach((el, i) => el.setAttribute("data-on", i <= n ? "1" : "0"));
    stepLabel.textContent = `Step ${n + 1} of ${STEPS.length} — ${STEPS[n]}`;
    prevBtn.hidden = n === 0;
    nextBtn.hidden = n === STEPS.length - 1;
    submitBtn.hidden = n !== STEPS.length - 1;
    formStatus.textContent = "";
    formStatus.className = "status";
  }

  function validateStep(n) {
    const fields = steps[n].querySelectorAll("input, textarea, select");
    for (const el of fields) {
      if (!el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    const age = form.elements.ageOk?.value;
    if (n === 0 && age === "under15") {
      formStatus.textContent = "You must be 15 or older to apply.";
      formStatus.className = "status err";
      return false;
    }
    return true;
  }

  prevBtn.addEventListener("click", () => showStep(Math.max(0, step - 1)));
  nextBtn.addEventListener("click", () => {
    if (!validateStep(step)) return;
    showStep(Math.min(STEPS.length - 1, step + 1));
  });

  function collect() {
    const fd = new FormData(form);
    const o = {};
    for (const [k, v] of fd.entries()) o[k] = String(v).trim();
    o.submittedAt = new Date().toISOString();
    return o;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    const data = collect();
    if (data.ageOk === "under15") {
      formStatus.textContent = "You must be 15 or older to apply.";
      formStatus.className = "status err";
      return;
    }

    submitBtn.disabled = true;
    formStatus.textContent = "Submitting…";
    formStatus.className = "status";

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application: data }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.ok) {
        throw new Error(
          payload.hint ||
            payload.error ||
            `Submit failed (${res.status}). Try again later.`,
        );
      }

      doneText.textContent =
        "Thanks — your application was posted to staff Application Logs. We’ll reply within 7–14 days. Don’t DM staff unless we contact you.";
      form.hidden = true;
      document.querySelector(".progress").hidden = true;
      stepLabel.hidden = true;
      donePanel.classList.add("show");
    } catch (err) {
      formStatus.textContent = err?.message || "Submit failed. Try again later.";
      formStatus.className = "status err";
      submitBtn.disabled = false;
    }
  });

  showStep(0);
})();
