export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function createCheckoutSession(plan: string, userId: string, email: string): Promise<string> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, userId, email }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Errore nel pagamento');
  }
  const data = await res.json();
  return data.url;
}

export async function sendTeamContact(data: {
  name: string;
  email: string;
  message: string;
  plan?: string;
}): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Errore invio richiesta');
  }
}
