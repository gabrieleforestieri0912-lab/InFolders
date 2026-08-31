(function() {
  var DEFAULT_SITE_URL = "https://infolders.app";

  function getApiBaseUrl() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["infolders_site_url"], (result) => {
        if (result && result.infolders_site_url) {
          resolve(String(result.infolders_site_url).replace(/\/+$/, ""));
        } else {
          resolve(DEFAULT_SITE_URL);
        }
      });
    });
  }

  var statusEl = document.getElementById("status-message");
  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    if (type === "success") statusEl.style.color = "#22c55e";
    else if (type === "error") statusEl.style.color = "#ef4444";
    else if (type === "warn") statusEl.style.color = "#f59e0b";
    else statusEl.style.color = "#a78bfa";
  }

  var closeBtn = document.getElementById("close-subscriptions");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => window.close());
  }

  document.querySelectorAll(".pricing-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.plan;
      if (plan === "free") {
        setStatus("Sei già sul piano Free.", "info");
        return;
      }
      if (plan === "team") {
        chrome.tabs.create({
          url: "mailto:support@infolders.app?subject=Richiesta%20piano%20Team%20InFolders"
        });
        setStatus("Apertura email di contatto...", "info");
        return;
      }
      // Piano Pro: richiede l'accesso e avvia il checkout Stripe
      chrome.storage.local.get(["currentUser"], async (result) => {
        const user = result.currentUser;
        if (!user || !user.id || !user.email) {
          setStatus("Accedi prima di procedere al pagamento.", "warn");
          return;
        }
        setStatus("Reindirizzamento a Stripe...", "info");
        try {
          const baseUrl = await getApiBaseUrl();
          const res = await fetch(`${baseUrl}/api/create-checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan, userId: user.id, email: user.email })
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Errore nel pagamento");
          }
          chrome.tabs.create({ url: data.url });
          setStatus("Pagamento avviato: apri la finestra di Stripe.", "success");
        } catch (err) {
          setStatus(err.message || "Errore nel pagamento. Riprova più tardi.", "error");
        }
      });
    });
  });
})();
