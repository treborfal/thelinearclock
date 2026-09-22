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
      '<span class="confirm-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" fill="none" class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M23.5 8.7c-.5-2-1.2-3.9-3-5.1a.3.3 0 1 0-.3.4c3 2.2 4.3 9.5 1 14a10.8 10.8 0 0 1-17.5.8c-5.4-7-2-17.1 7.8-18a12 12 0 0 1 5.1.5.3.3 0 0 0 .3-.6q-2.7-.9-5.5-.7a12 12 0 0 0-8.6 19.5 12 12 0 0 0 9.8 4.5c7.1-.3 12.9-7.3 10.9-15.3"/><path fill="currentColor" d="M17.9 5a.3.3 0 0 0-.4.2l-.4.6-4.4 5.9-3.2 4.4-.8 1h-.2l-.5-.2-2.2-2.2q-.2-.6-.6-.4-.3 0-.1.4l.1.2L7 17l1.3 1a1 1 0 0 0 1 0l1.7-2q1-1.2 2.1-3l5-7.9z"/></svg></span>' +
      '<h2>You’re on the list.</h2>' +
      '<p>Thanks — your interest genuinely helps decide whether the Linear Clock gets made. ' +
      'I’ll email you first when I’ve got news.</p>';
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
