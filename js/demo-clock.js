// script.js

document.addEventListener("DOMContentLoaded", () => {
  // 1) Load saved settings or defaults
  const settings = {
    theme:  localStorage.getItem("theme")  || "dark",
    layout: localStorage.getItem("layout") || "linear",
    format: localStorage.getItem("format") || "standard"
  };

  // 2) Grab DOM elements
  const overlay        = document.getElementById("settings-overlay");
  const dialog         = document.getElementById("settings-dialog");
  const closeBtn       = document.getElementById("close-settings");
  const clockContainer = document.querySelector(".clock-container");
  const settingGroups  = document.querySelectorAll(".setting-group");
  const timeTextEl     = document.querySelector(".time-text");

  // 3) Inject “Current time is …” under the <h2>Settings</h2>
  const settingsHeader = dialog.querySelector("h2");
  const currentTimeEl  = document.createElement("div");
  currentTimeEl.id     = "current-time";
  currentTimeEl.style.fontSize = "1rem";
  settingsHeader.insertAdjacentElement("afterend", currentTimeEl);

  // 4) Initialize tab‑style radios from saved settings
  settingGroups.forEach(group => {
    const name  = group.dataset.setting;   // "theme" | "layout" | "format"
    const value = settings[name];
    const radio = group.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) radio.checked = true;
  });

  // 5) Number conversion helpers
  const kanjiNums = ["零","一","二","三","四","五","六","七","八","九"];
  function numberToKanji(n) {
    if (n <= 9) return kanjiNums[n];
    const tens = Math.floor(n/10), ones = n % 10;
    let s = "";
    if (tens > 0) s += (tens>1 ? kanjiNums[tens] : "") + "十";
    if (ones > 0) s += kanjiNums[ones];
    return s;
  }
  function numberToRoman(num) {
    const romans = [
      [1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],
      [100,"C"],[90,"XC"],[50,"L"],[40,"XL"],
      [10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]
    ];
    let out = "";
    for (const [v,sym] of romans) {
      while (num >= v) {
        out += sym;
        num -= v;
      }
    }
    return out;
  }

  // 6) Apply theme & layout and persist to localStorage
  function applySettings() {
    document.body.classList.toggle("light-theme",  settings.theme === "light");
    clockContainer.classList.toggle("layout-stack",  settings.layout === "stack");
    clockContainer.classList.toggle("layout-linear", settings.layout === "linear");
    localStorage.setItem("theme",  settings.theme);
    localStorage.setItem("layout", settings.layout);
    localStorage.setItem("format", settings.format);
  }

  // 7) Main clock update routine
  function updateClock() {
    const now   = new Date();
    const h24   = now.getHours();
    const mins  = now.getMinutes();
    const isAM  = h24 < 12;
    const h12   = h24 % 12 || 12;

    // Update each hour-dot (label & active state)
    document.querySelectorAll(".hour-dot").forEach(hd => {
      const h     = parseInt(hd.dataset.hour, 10);
      const hourE = hd.querySelector(".hour");
      if (!hourE) return;

      // rewrite label if needed
      if (settings.format === "kanji") {
        hourE.textContent = numberToKanji(h);
      } else if (settings.format === "roman") {
        hourE.textContent = numberToRoman(h);
      } else {
        hourE.textContent = h;
      }

      // active styling
      hourE.classList.toggle("active", h === h12);
    });

    // Highlight dots based on minutes
    const dotCount = Math.floor(mins / 5);
    document.querySelectorAll(".dot").forEach(d => {
      const idx = parseInt(d.dataset.index, 10);
      d.classList.toggle("active", idx <= dotCount);
    });

    // AM/PM labels (swap to Kanji if needed)
    const amEl = document.querySelector(".am-pm-center .am");
    const pmEl = document.querySelector(".am-pm-center .pm");
    if (amEl && pmEl) {
      if (settings.format === "kanji") {
        amEl.textContent = "午前";
        pmEl.textContent = "午後";
      } else {
        amEl.textContent = "AM";
        pmEl.textContent = "PM";
      }
      amEl.classList.toggle("active", isAM);
      pmEl.classList.toggle("active", !isAM);
    }

    // Digital time-text if present
    if (timeTextEl) {
      let disp;
      if (settings.format === "kanji") {
        disp = `${numberToKanji(h12)}時${mins === 0 ? "零" : numberToKanji(mins)}分`;
      } else if (settings.format === "roman") {
        disp = `${numberToRoman(h12)}:${mins < 10 ? "0"+mins : numberToRoman(mins)}`;
      } else {
        disp = `${h12}:${mins < 10 ? "0"+mins : mins}${isAM ? "AM" : "PM"}`;
      }
      timeTextEl.textContent = disp;
    }

    // Optional: moving gradient if implemented
    if (typeof moveGradient === "function") {
      moveGradient(h24, mins);
    }
  }

  // 8) Initialize clock and settings
  applySettings();
  updateClock();
  setInterval(updateClock, 1000);

  // 9) Overlay open/close behavior (update current time on open)
  document.body.addEventListener("click", () => {
    if (!overlay.classList.contains("active")) {
		const now    = new Date();
		const hhmm   = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		currentTimeEl.textContent = `Current time is ${hhmm}`;
      overlay.classList.add("active");
    }
  });
  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      e.stopPropagation();
    }
  });
  dialog.addEventListener("click", e => {
    e.stopPropagation();
  });
  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  // 10) Handle tab‑style radio changes
  settingGroups.forEach(group => {
    group.addEventListener("change", e => {
      const name = group.dataset.setting;
      if (e.target.name === name) {
        settings[name] = e.target.value;
        applySettings();
        if (name === "format") {
          updateClock();
        }
      }
    });
  });
});
