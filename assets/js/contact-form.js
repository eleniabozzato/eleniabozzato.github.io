// Elenia Bozzato — contact-form.js
// Handles the contatti.html form: validation, Cloudflare Turnstile check, fetch submit to PostTo.
// The endpoint is the form's `action` (https://postto.dev/api/v1/send/<token>), so the form
// still works as a plain HTML POST if this script fails to load.
// PostTo docs: https://postto.dev/docs (reserved fields _hp / cf-turnstile-response, JSON via Accept header).
(function () {
  "use strict";

  const FALLBACK_ERROR =
    "Si è verificato un errore nell'invio. Riprova più tardi o scrivimi direttamente a hello@eleniabozzato.com.";

  // PostTo error codes (https://postto.dev/docs/response-format) → messages for the visitor
  const ERROR_MESSAGES = {
    turnstile_failed: "La verifica anti-spam non è andata a buon fine. Riprova.",
    rate_limited: "Hai inviato troppi messaggi in poco tempo. Attendi un momento e riprova.",
    empty_submission: "Compila tutti i campi prima di inviare.",
  };

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#contact-form");
    if (!form) return;

    const endpoint = form.getAttribute("action");
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

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();
      const token = String(data.get("cf-turnstile-response") || "");

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

      data.set("name", name);
      data.set("email", email);
      data.set("message", message);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Invio in corso…";
      }
      setStatus("", null);

      // FormData keeps the request "simple" (no CORS preflight); Accept asks PostTo for JSON instead of a redirect.
      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () {
              return {};
            })
            .then(function (body) {
              if (!response.ok) {
                const error = new Error(body.message || "Risposta non valida dal server (" + response.status + ")");
                error.code = body.error;
                throw error;
              }
              return body;
            });
        })
        .then(function () {
          setStatus("Messaggio inviato! Ti risponderò il prima possibile.", "success");
          form.reset();
          resetTurnstile();
        })
        .catch(function (err) {
          console.error("Errore invio form contatti:", err);
          setStatus(ERROR_MESSAGES[err.code] || FALLBACK_ERROR, "error");
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
