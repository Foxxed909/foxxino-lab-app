(function () {
  const { models, suites, recovery } = window.FOXXINO;
  const modelEl = document.getElementById("model");
  const resistanceEl = document.getElementById("resistance");
  const searchEl = document.getElementById("search");
  const suitesEl = document.getElementById("suites");
  const outEl = document.getElementById("out");
  const metaEl = document.getElementById("meta");
  const toast = document.getElementById("toast");

  let activeId = null;

  models.forEach((m) => {
    const o = document.createElement("option");
    o.value = m.id;
    o.textContent = m.name;
    modelEl.appendChild(o);
  });

  function filtered() {
    const model = modelEl.value;
    const res = resistanceEl.value;
    const q = searchEl.value.trim().toLowerCase();
    return suites.filter((s) => {
      if (!s.models.includes(model) && model !== "universal") {
        // still show universal suites for any model
        if (!s.models.includes("universal")) return false;
      }
      if (model !== "universal" && !s.models.includes(model) && !s.models.includes("universal")) return false;
      if (model !== "universal" && s.models.includes(model) === false && s.models.includes("universal")) {
        // keep universal suites always
      }
      if (res !== "all" && !s.resistance.includes(res)) return false;
      if (q) {
        const hay = (s.name + " " + s.id + " " + (s.tags || []).join(" ")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // Prefer model-specific: if filtering a specific model, include suite if it lists that model OR is universal-only toolkit
      if (model !== "universal") {
        return s.models.includes(model) || s.models.includes("universal");
      }
      return true;
    });
  }

  function renderList() {
    const list = filtered();
    suitesEl.innerHTML = "";
    list.forEach((s) => {
      const b = document.createElement("button");
      b.className = "suite-btn" + (s.id === activeId ? " active" : "");
      b.innerHTML = s.name + "<small>" + (s.tags || []).join(" · ") + "</small>";
      b.onclick = () => select(s.id);
      suitesEl.appendChild(b);
    });
    if (list.length && !list.find((s) => s.id === activeId)) select(list[0].id);
    if (!list.length) {
      outEl.textContent = "No suites for this filter.";
      metaEl.innerHTML = "";
      activeId = null;
    }
  }

  function select(id) {
    activeId = id;
    const s = suites.find((x) => x.id === id);
    if (!s) return;
    outEl.textContent = s.body;
    metaEl.innerHTML =
      '<span class="tag ok">' +
      s.id +
      "</span>" +
      (s.tags || []).map((t) => '<span class="tag">' + t + "</span>").join("") +
      '<span class="tag">' +
      (s.resistance || []).join("/") +
      "</span>";
    renderList();
  }

  function showToast(msg) {
    toast.textContent = msg || "Copied";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1200);
  }

  async function copyText(t) {
    await navigator.clipboard.writeText(t);
    showToast("Copied");
  }

  document.getElementById("copy").onclick = () => {
    if (!activeId) return;
    copyText(suites.find((s) => s.id === activeId).body);
  };
  document.getElementById("copyRecovery").onclick = () => copyText(recovery);
  document.getElementById("copyZ").onclick = () => {
    if (!activeId) return;
    const s = suites.find((x) => x.id === activeId);
    let t = s.body;
    if (!t.includes("{Z}")) t = t + "\n\n{Z} =";
    copyText(t);
  };

  modelEl.onchange = renderList;
  resistanceEl.onchange = renderList;
  searchEl.oninput = renderList;

  renderList();
})();
