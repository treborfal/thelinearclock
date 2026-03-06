// Updated script.js without theme/layout toggles, only clock logic, defaulting to light theme

// Main clock update function
// Adds light-theme by default on page load

document.addEventListener("DOMContentLoaded", () => {
  // Default to light theme
  document.body.classList.add("light-theme");

  document.querySelectorAll(".js-current-year").forEach((yearEl) => {
    yearEl.textContent = new Date().getFullYear();
  });

  function updateClock() {
    const now = new Date();
    const hour24 = now.getHours();
    const minutes = now.getMinutes();

    // Determine AM or PM
    const isAM = hour24 < 12;
    // Convert 24-hour to 12-hour format
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;

    // Highlight current hour
    document.querySelectorAll(".hour-dot").forEach(hourDot => {
      const h = parseInt(hourDot.getAttribute("data-hour"), 10);
      const hourEl = hourDot.querySelector(".hour");
      if (hourEl) hourEl.classList.toggle("active", h === hour12);
    });

    // Highlight dots based on minutes
    const highlightCount = Math.floor(minutes / 5);
    document.querySelectorAll(".dot").forEach(dot => {
      const index = parseInt(dot.getAttribute("data-index"), 10);
      dot.classList.toggle("active", index <= highlightCount);
    });

    // AM/PM indicators
    const amEl = document.querySelector(".am-pm-center .am");
    const pmEl = document.querySelector(".am-pm-center .pm");
    if (amEl && pmEl) {
      amEl.classList.toggle("active", isAM);
      pmEl.classList.toggle("active", !isAM);
    }

    // Display the time if time-text exists
    const timeTextEl = document.querySelector(".time-text");
    if (timeTextEl) {
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      timeTextEl.textContent = `${hour12}:${minutesStr}${isAM ? 'AM' : 'PM'}`;
    }

    // Optional: moving gradient if implemented
    if (typeof moveGradient === 'function') {
      moveGradient(hour24, minutes);
    }
  }

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);
});
