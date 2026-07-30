import { isPremiumFromStorage } from './lib/plans';
import { createCheckoutSession } from './lib/api';
import { initSupabase } from '../lib/supabase';
import { syncUserData } from '../lib/data-service';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './lib/config';

let currentUserId = '';
let currentUserEmail = '';

document.addEventListener('DOMContentLoaded', () => {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch {}
  }

  const buttons = document.querySelectorAll('.pricing-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => handlePlanSelect((btn as HTMLElement).dataset.plan || ''));
  });

  chrome.storage.local.get(['currentUser'], (res: Record<string, any>) => {
    if (res.currentUser) {
      currentUserId = res.currentUser.id || '';
      currentUserEmail = res.currentUser.email || '';
    }
    checkSubscription();
  });
});

function checkSubscription(): void {
  chrome.storage.local.get(['infolders_premium'], (result: Record<string, any>) => {
    if (isPremiumFromStorage(result.infolders_premium)) {
      showStatus('✅ Sei già Premium! Goditi tutte le funzionalità.', 'success');
      disableButtons();
    } else if (currentUserId) {
      syncPremiumFromSupabase();
    }
  });
}

async function syncPremiumFromSupabase(): Promise<void> {
  try {
    const data = await syncUserData(currentUserId);
    if (data && data.premiumData) {
      chrome.storage.local.set({ infolders_premium: data.premiumData }, () => {
        showStatus('✅ Sei già Premium! Goditi tutte le funzionalità.', 'success');
        disableButtons();
      });
    }
  } catch {
    console.warn('syncPremiumFromSupabase: could not fetch');
  }
}

function disableButtons(): void {
  document.querySelectorAll('.pricing-btn').forEach(btn => {
    btn.textContent = 'Piano attivo';
    (btn as HTMLButtonElement).disabled = true;
    (btn as HTMLElement).style.background = 'rgba(34, 197, 94, 0.2)';
    (btn as HTMLElement).style.borderColor = '#22c55e';
    (btn as HTMLElement).style.color = '#4ade80';
  });
}

function handlePlanSelect(plan: string): void {
  if (plan === 'free') {
    showStatus('Sei già sul piano Free.', 'info');
    return;
  }

  if (!currentUserId) {
    showStatus('Accedi prima di procedere al pagamento.', 'info');
    return;
  }

  showStatus('⏳ Reindirizzamento a Stripe...', 'info');

  createCheckoutSession(plan, currentUserId, currentUserEmail)
    .then((url) => {
      window.open(url, '_blank');
      showStatus('Pagamento avviato. Completa il checkout nella nuova finestra.', 'info');
    })
    .catch((err) => {
      showStatus('Errore: ' + (err.message || 'Riprova più tardi.'), 'info');
    });
}

function showStatus(message: string, type: 'success' | 'info'): void {
  const status = document.getElementById('status-message')!;
  status.textContent = message;
  status.className = type === 'success' ? 'status-success' : 'status-info';
  status.style.padding = '10px';
  status.style.borderRadius = '6px';
  status.style.marginTop = '15px';
  if (type === 'success') {
    status.style.background = 'rgba(34, 197, 94, 0.15)';
    status.style.border = '1px solid #22c55e';
    status.style.color = '#4ade80';
  } else {
    status.style.background = 'rgba(59, 130, 246, 0.15)';
    status.style.border = '1px solid #3b82f6';
    status.style.color = '#60a5fa';
  }
}
