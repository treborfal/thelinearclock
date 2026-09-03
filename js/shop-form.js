const endpoint = "https://script.google.com/macros/s/AKfycbzO7lmY6q5DmwJaqhFCr-ak-dhD5DWuRjHFpOuMkEJgFZ9eypoWvBpCxE9a6znBtf5hfw/exec";
const minDwellMs = 3000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("notify-button");
  const form = document.getElementById("email-form");
  const responseMessage = document.getElementById("response-message");
  const openedAt = Date.now();

  if (!button || !form || !responseMessage) return;

  // the block that holds the heading, intro copy, form and terms — swapped out on success
  const panel = form.parentElement;

  const showConfirmation = () => {
    panel.innerHTML =
      '<h2>You’re on the list.</h2>' +
      '<p>Thanks — your interest genuinely helps decide whether the Linear Clock gets made. ' +
      'We’ll email you first when there’s news.</p>';
    panel.setAttribute("role", "status");
    panel.setAttribute("tabindex", "-1");
    panel.focus();
  };

  button.addEventListener("click", () => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "notify_click", {
        event_category: "Signup",
        event_label: "Early Access Form"
      });
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.email.value;
    const honeypot = form.website ? form.website.value : "";
    const submittedAt = Date.now();
    const dwellMs = submittedAt - openedAt;

    if (honeypot) {
      responseMessage.innerText = "We couldn't process your signup. Please try again.";
      form.reset();
      return;
    }

    if (dwellMs < minDwellMs) {
      responseMessage.innerText = "Please take a moment and try again.";
      return;
    }

    if (!emailPattern.test(String(email || "").trim())) {
      responseMessage.innerText = "Please enter a valid email address.";
      return;
    }

    button.disabled = true;
    responseMessage.innerText = "Sending…";

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("submittedAt", String(submittedAt));
      formData.append("dwellMs", String(dwellMs));
      formData.append("website", honeypot);
      formData.append("origin", window.location.origin);

      if (typeof window.turnstile === "object" && typeof window.turnstile.getResponse === "function") {
        const turnstileToken = window.turnstile.getResponse();
        if (turnstileToken) {
          formData.append("turnstileToken", turnstileToken);
        }
      }

      await fetch(endpoint, { method: "POST", mode: "no-cors", body: formData });

      if (typeof window.gtag === "function") {
        window.gtag("event", "notify_submit", {
          event_category: "Signup",
          event_label: "Early Access Form"
        });
      }

      showConfirmation();
    } catch (error) {
      button.disabled = false;
      responseMessage.innerText = "Something went wrong sending that. Please try again.";
    }
  });
});
