import type { InstructionProfile } from '../../lib/types';

const STORAGE_KEY = 'infolders_profiles';
const ACTIVE_KEY = 'infolders_active_profile';

const DEFAULT_PROFILES: InstructionProfile[] = [
  {
    id: 1,
    name: 'Sviluppatore',
    description: 'Risposte tecniche con focus sul codice',
    instructions: 'Sei un assistente tecnico specializzato in sviluppo software. Fornisci risposte dettagliate con esempi di codice, best practice e spiegazioni tecniche. Quando possibile, includi snippet di codice funzionanti e riferimenti a documentazione ufficiale.',
    color: '#3b82f6',
  },
  {
    id: 2,
    name: 'Marketing',
    description: 'Copywriting, SEO e campagne advertising',
    instructions: 'Sei un esperto di marketing digitale. Rispondi con un focus su strategie di marketing, copywriting persuasivo, ottimizzazione SEO e campagne pubblicitarie. Utilizza un linguaggio orientato ai risultati e alla conversione.',
    color: '#a855f7',
  },
  {
    id: 3,
    name: 'Consulente',
    description: 'Linguaggio professionale e orientamento business',
    instructions: 'Sei un consulente senior. Fornisci risposte strutturate con executive summary, analisi dei punti chiave e raccomandazioni attuabili. Usa un linguaggio professionale e orientato al business. Struttura le risposte in sezioni chiare.',
    color: '#22c55e',
  },
];

export function loadProfiles(): InstructionProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    return stored && Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_PROFILES;
  } catch { return DEFAULT_PROFILES; }
}

export function saveProfiles(list: InstructionProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addProfile(name: string, instructions: string, description: string, color: string): InstructionProfile {
  const profiles = loadProfiles();
  const profile: InstructionProfile = { id: Date.now(), name, instructions, description, color };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function deleteProfile(id: number): void {
  const active = getActiveProfile();
  if (active?.id === id) clearActiveProfile();
  saveProfiles(loadProfiles().filter(p => p.id !== id));
}

export function getActiveProfile(): InstructionProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setActiveProfile(profile: InstructionProfile): void {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(profile));
}

export function clearActiveProfile(): void {
  localStorage.removeItem(ACTIVE_KEY);
}

export function getProfileInstructions(): string {
  const active = getActiveProfile();
  return active ? active.instructions : '';
}
