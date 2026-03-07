// Site-wide behavior and clock rendering.

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("light-theme");

  document.querySelectorAll(".js-current-year").forEach((yearEl) => {
    yearEl.textContent = new Date().getFullYear();
  });

  const navToggle = document.querySelector(".navbar-toggle");
  const navMenu = document.getElementById("navbar");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navToggle.classList.toggle("collapsed", expanded);
      navMenu.classList.toggle("in", !expanded);
      navMenu.setAttribute("aria-expanded", String(!expanded));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.classList.add("collapsed");
        navMenu.classList.remove("in");
        navMenu.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (typeof window.WOW === "function") {
    new window.WOW().init();
  }

  function updateClock() {
    const now = new Date();
    const hour24 = now.getHours();
    const minutes = now.getMinutes();

    const isAM = hour24 < 12;
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;

    document.querySelectorAll(".hour-dot").forEach((hourDot) => {
      const h = parseInt(hourDot.getAttribute("data-hour"), 10);
      const hourEl = hourDot.querySelector(".hour");
      if (hourEl) hourEl.classList.toggle("active", h === hour12);
    });

    const highlightCount = Math.floor(minutes / 5);
    document.querySelectorAll(".dot").forEach((dot) => {
      const index = parseInt(dot.getAttribute("data-index"), 10);
      dot.classList.toggle("active", index <= highlightCount);
    });

    const amEl = document.querySelector(".am-pm-center .am");
    const pmEl = document.querySelector(".am-pm-center .pm");
    if (amEl && pmEl) {
      amEl.classList.toggle("active", isAM);
      pmEl.classList.toggle("active", !isAM);
    }

    const timeTextEl = document.querySelector(".time-text");
    if (timeTextEl) {
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      timeTextEl.textContent = `${hour12}:${minutesStr}${isAM ? "AM" : "PM"}`;
    }

    if (typeof moveGradient === "function") {
      moveGradient(hour24, minutes);
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
});
