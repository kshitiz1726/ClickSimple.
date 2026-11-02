(() => {
  // Prevent a second copy of the assistant from appearing.
  if (document.getElementById("clicksimple-host")) {
    document.getElementById("clicksimple-host").shadowRoot.querySelector(".cs-panel").classList.toggle("cs-hidden");
    return;
  }

  const host = document.createElement("div");
  host.id = "clicksimple-host";
  host.style.cssText = "all:initial;position:fixed;z-index:2147483647;top:18px;right:18px;";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      *{box-sizing:border-box} .cs-panel{font-family:Arial,sans-serif;width:330px;max-height:calc(100vh - 36px);overflow:auto;background:#fff;color:#17231d;border:1px solid #dce7df;border-radius:16px;box-shadow:0 12px 45px #102b1d35;padding:17px}
      .cs-hidden{display:none!important}.cs-head{display:flex;align-items:center;gap:9px}.cs-logo{width:32px;height:32px;border-radius:10px;background:#e5f5eb;color:#16834a;display:grid;place-items:center;font-weight:800}.cs-title{font-size:16px;font-weight:800;flex:1}.cs-close{border:0;background:#f1f4f1;border-radius:8px;padding:6px 9px;cursor:pointer}
      .cs-sub{font-size:12px;color:#68756d;margin:4px 0 16px}.cs-question{font-size:17px;font-weight:700;margin:12px 0}.cs-option{width:100%;display:block;text-align:left;padding:11px;margin:7px 0;border:1px solid #e0e8e2;border-radius:10px;background:#fff;color:#1c2b22;cursor:pointer}.cs-option:hover{border-color:#16834a;background:#f5fbf7}.cs-option b{display:block;font-size:13px}.cs-option small{display:block;color:#728077;font-size:11px;margin-top:4px}.cs-input{width:100%;padding:10px;border:1px solid #ccd8cf;border-radius:9px;font-size:13px;margin:8px 0}.cs-primary{background:#16834a;color:#fff;border:0;border-radius:9px;padding:11px 14px;font-weight:700;cursor:pointer}.cs-secondary{background:#f0f4f1;color:#24402e;border:0;border-radius:9px;padding:11px 14px;cursor:pointer}.cs-row{display:flex;gap:8px;margin-top:13px}.cs-row button{flex:1}.cs-step{font-size:11px;color:#16834a;font-weight:700;margin:15px 0 7px}.cs-instruction{font-size:14px;line-height:1.5;margin:0 0 10px}.cs-progress{height:6px;background:#e9eee9;border-radius:9px;overflow:hidden}.cs-progress span{display:block;height:100%;background:#16834a;transition:width .2s}.cs-note{font-size:11px;color:#78847c;line-height:1.4;margin-top:12px}.cs-target{outline:3px solid #18a45a!important;outline-offset:4px!important;scroll-margin:100px!important;position:relative!important}
      @media(max-width:420px){.cs-panel{width:min(330px,calc(100vw - 24px));max-height:calc(100vh - 24px)}}
    </style>
    <section class="cs-panel" role="dialog" aria-label="ClickSimple assistant">
      <div class="cs-head"><div class="cs-logo">C</div><div class="cs-title">ClickSimple</div><button class="cs-close" aria-label="Close assistant">✕</button></div>
      <p class="cs-sub">Complex interfaces. Simple instructions.</p>
      <div class="cs-content"></div>
    </section>`;

  const panel = shadow.querySelector(".cs-panel");
  const content = shadow.querySelector(".cs-content");
  let steps = [];
  let current = 0;
  let highlighted = null;

  shadow.querySelector(".cs-close").addEventListener("click", () => panel.classList.add("cs-hidden"));

  function cleanLabel(el) {
    const aria = el.getAttribute("aria-label");
    const text = (aria || el.innerText || el.value || el.placeholder || el.title || el.name || el.tagName).trim();
    return text.replace(/\s+/g, " ").slice(0, 90);
  }

  function visible(el) {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  }

  function collect(selector) {
    return [...document.querySelectorAll(selector)].filter(visible).filter(el => !host.contains(el));
  }

  function clearHighlight() {
    if (highlighted) highlighted.classList.remove("cs-target");
    highlighted = null;
  }

  function showHome() {
    clearHighlight();
    content.innerHTML = `
      <div class="cs-question">What would you like to do?</div>
      <button class="cs-option" data-task="form"><b>📝 Fill out a form</b><small>Find fields and move through them one at a time.</small></button>
      <button class="cs-option" data-task="search"><b>🔎 Find something</b><small>Locate a search box or matching page content.</small></button>
      <button class="cs-option" data-task="navigate"><b>🧭 Navigate this website</b><small>Explore the main links and buttons.</small></button>
      <button class="cs-option" data-task="custom"><b>💬 I have a different task</b><small>Tell us what you're trying to find.</small></button>
      <p class="cs-note">ClickSimple suggests where to go. You stay in control of every click and submission.</p>`;
    content.querySelectorAll("[data-task]").forEach(btn => btn.addEventListener("click", () => begin(btn.dataset.task)));
  }

  function makeSteps(task, query = "") {
    if (task === "form") {
      const fields = collect("input:not([type=hidden]):not([type=submit]):not([type=button]),textarea,select");
      return fields.slice(0, 12).map((el, i) => ({
        el, title: `Form field ${i + 1} of ${Math.min(fields.length, 12)}`,
        detail: `Look for “${cleanLabel(el)}”. Select or complete this field.`
      }));
    }
    if (task === "search") {
      const searchBoxes = collect('input[type="search"],input[placeholder],input[aria-label],input[name*="search" i]');
      const preferred = searchBoxes.find(el => /search|find|query/i.test(cleanLabel(el) + " " + el.name));
      const target = preferred || searchBoxes[0];
      const matches = query ? collect("a,button,h1,h2,h3,[role=button],p,li").filter(el => cleanLabel(el).toLowerCase().includes(query.toLowerCase())) : [];
      const result = [];
      if (target) result.push({el:target,title:"Find the search box",detail:`This looks like a search field: “${cleanLabel(target)}”. Select it and type what you're looking for.`});
      if (matches.length) result.push({el:matches[0],title:"Look at this matching result",detail:`This page contains text matching “${query}”. Review the highlighted result.`});
      if (!result.length) result.push({el:null,title:"No clear match found",detail:"Try the website's own menu or search feature. You can also choose another task."});
      return result;
    }
    if (task === "navigate") {
      const items = collect("a[href],button,[role=button]").filter(el => cleanLabel(el).length > 1);
      return items.slice(0, 8).map((el,i)=>({el,title:`Explore option ${i+1} of ${Math.min(items.length,8)}`,detail:`This is an available website option: “${cleanLabel(el)}”. Select it if it matches what you need.`}));
    }
    const candidates = collect("a[href],button,input,textarea,select,[role=button],h1,h2,h3");
    const match = candidates.find(el => query && cleanLabel(el).toLowerCase().includes(query.toLowerCase()));
    return [{el:match || null,title:match ? "Possible match found" : "Let's narrow it down",detail:match ? `This element may match “${query}”. Check whether it is what you need.` : `I couldn't find an exact visible match for “${query}”. Try a shorter keyword or use Find something.`}];
  }

  function begin(task) {
    if (task === "custom") {
      content.innerHTML = `<div class="cs-question">What are you trying to do?</div><input class="cs-input" id="cs-query" placeholder="e.g. Find the contact page" aria-label="Describe your task"><div class="cs-row"><button class="cs-secondary" id="cs-back">Back</button><button class="cs-primary" id="cs-go">Guide me</button></div>`;
      content.querySelector("#cs-back").addEventListener("click", showHome);
      content.querySelector("#cs-go").addEventListener("click", () => {
        const q = content.querySelector("#cs-query").value.trim();
        if (!q) return;
        startSteps(makeSteps("custom", q));
      });
      return;
    }
    if (task === "search") {
      const fields = collect('input[type="search"],input[placeholder],input[aria-label],input[name*="search" i]');
      if (fields.length) {
        startSteps(makeSteps(task));
      } else {
        content.innerHTML = `<div class="cs-question">What are you looking for?</div><input class="cs-input" id="cs-query" placeholder="Enter a keyword"><div class="cs-row"><button class="cs-secondary" id="cs-back">Back</button><button class="cs-primary" id="cs-go">Find</button></div>`;
        content.querySelector("#cs-back").addEventListener("click", showHome);
        content.querySelector("#cs-go").addEventListener("click", () => {
          const q=content.querySelector("#cs-query").value.trim();
          if(q) startSteps(makeSteps("search",q));
        });
      }
      return;
    }
    startSteps(makeSteps(task));
  }

  function startSteps(newSteps) {
    steps = newSteps;
    current = 0;
    if (!steps.length) steps = [{el:null,title:"Nothing to guide yet",detail:"This page doesn't seem to contain visible elements for this task. Try another task or website."}];
    renderStep();
  }

  function renderStep() {
    clearHighlight();
    const step = steps[current];
    if (step.el && document.contains(step.el)) {
      highlighted = step.el;
      highlighted.classList.add("cs-target");
      step.el.scrollIntoView({behavior:"smooth",block:"center"});
    }
    const pct = Math.round(((current + 1) / steps.length) * 100);
    content.innerHTML = `
      <div class="cs-step">STEP ${current + 1} OF ${steps.length}</div>
      <div class="cs-question">${step.title}</div>
      <p class="cs-instruction">${step.detail}</p>
      <div class="cs-progress" aria-label="Progress"><span style="width:${pct}%"></span></div>
      <div class="cs-row">
        <button class="cs-secondary" id="cs-home">Tasks</button>
        <button class="cs-primary" id="cs-next">${current === steps.length-1 ? "Finish" : "Next step →"}</button>
      </div>
      <p class="cs-note">A green outline marks the suggested element. Click it yourself if appropriate. ClickSimple will never submit a form or make a purchase for you.</p>`;
    content.querySelector("#cs-home").addEventListener("click", showHome);
    content.querySelector("#cs-next").addEventListener("click", () => {
      if (current < steps.length - 1) { current++; renderStep(); }
      else { clearHighlight(); showHome(); }
    });
  }

  showHome();
})();