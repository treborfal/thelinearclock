const endpoint = "https://script.google.com/macros/s/AKfycbzO7lmY6q5DmwJaqhFCr-ak-dhD5DWuRjHFpOuMkEJgFZ9eypoWvBpCxE9a6znBtf5hfw/exec";
const minDwellMs = 3000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("notify-button");
  const form = document.getElementById("email-form");
  const responseMessage = document.getElementById("response-message");
  const openedAt = Date.now();

  if (!button || !form || !responseMessage) return;

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

      responseMessage.innerText = "Thanks! Your support means a lot!";
    } catch (error) {
      responseMessage.innerText = "Error connecting to server.";
    }

    form.reset();
  });
});
