// Elenia Bozzato — contact-form.js
// Handles the contatti.html form: validation, Cloudflare Turnstile check, fetch submit.
(function () {
  "use strict";

  const ENDPOINT = "https://api.eleniabozzato.com/contact"; // TODO: sostituire con backend reale

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#contact-form");
    if (!form) return;

    const statusEl = form.querySelector(".form-status");
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitBtnDefaultText = submitBtn ? submitBtn.textContent : "";

    function setStatus(message, state) {
      if (!statusEl) return;
      statusEl.textContent = message || "";
      if (state) {
        statusEl.setAttribute("data-state", state);
      } else {
        statusEl.removeAttribute("data-state");
      }
    }

    function resetTurnstile() {
      if (window.turnstile && typeof window.turnstile.reset === "function") {
        window.turnstile.reset();
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const nameField = form.querySelector('[name="name"]');
      const emailField = form.querySelector('[name="email"]');
      const messageField = form.querySelector('[name="message"]');
      const turnstileField = form.querySelector('[name="cf-turnstile-response"]');

      const name = nameField ? nameField.value.trim() : "";
      const email = emailField ? emailField.value.trim() : "";
      const message = messageField ? messageField.value.trim() : "";
      const token = turnstileField ? turnstileField.value : "";

      if (!name || !email || !message) {
        setStatus("Compila tutti i campi prima di inviare.", "error");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        setStatus("Inserisci un indirizzo email valido.", "error");
        return;
      }

      if (!token) {
        setStatus("Completa la verifica anti-spam.", "error");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Invio in corso…";
      }
      setStatus("", null);

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, message: message, token: token }),
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Risposta non valida dal server (" + response.status + ")");
          }
          return response.json().catch(function () {
            return {};
          });
        })
        .then(function () {
          setStatus("Messaggio inviato! Ti risponderò il prima possibile.", "success");
          form.reset();
          resetTurnstile();
        })
        .catch(function (err) {
          console.error("Errore invio form contatti:", err);
          setStatus("Si è verificato un errore nell'invio. Riprova più tardi o scrivimi direttamente a hello@eleniabozzato.com.", "error");
          resetTurnstile();
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtnDefaultText;
          }
        });
    });
  });
})();
