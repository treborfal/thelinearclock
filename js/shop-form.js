const endpoint = "https://script.google.com/macros/s/AKfycbzO7lmY6q5DmwJaqhFCr-ak-dhD5DWuRjHFpOuMkEJgFZ9eypoWvBpCxE9a6znBtf5hfw/exec";
const minDwellMs = 3000;

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

    try {
      const challengeRes = await fetch(`${endpoint}?action=challenge`, { method: "GET" });

      if (!challengeRes.ok) {
        throw new Error("Challenge request failed");
      }

      const challenge = await challengeRes.json();

      if (!challenge?.nonce || !challenge?.signature || !challenge?.issuedAt) {
        throw new Error("Failed to obtain challenge payload");
      }

      const formData = new FormData();
      formData.append("email", email);
      formData.append("nonce", challenge.nonce);
      formData.append("signature", challenge.signature);
      formData.append("issuedAt", challenge.issuedAt);
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

      const res = await fetch(endpoint, { method: "POST", body: formData });
      const text = await res.text();

      if (text === "Success" && typeof window.gtag === "function") {
        window.gtag("event", "notify_submit", {
          event_category: "Signup",
          event_label: "Early Access Form"
        });
      }

      responseMessage.innerText =
        text === "Success"
          ? "Thanks! Your support means a lot!."
          : text === "Invalid email"
            ? "Please enter a valid email address."
            : text === "CaptchaRequired"
              ? "Please complete verification and try again."
              : "We couldn't process your signup right now. Please try again later.";
    } catch (error) {
      responseMessage.innerText = "Error connecting to server.";
    }

    form.reset();
  });
});
