import type { Prompt } from '../../lib/types';

const STORAGE_KEY = 'infolders_prompts';

export function loadPrompts(): Prompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function savePrompts(list: Prompt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addPrompt(title: string, content: string, category: string): Prompt {
  const prompts = loadPrompts();
  const prompt: Prompt = { id: Date.now(), title, content, category, createdAt: new Date().toISOString() };
  prompts.unshift(prompt);
  savePrompts(prompts);
  return prompt;
}

export function deletePrompt(id: number): void {
  savePrompts(loadPrompts().filter(p => p.id !== id));
}

export function getPromptCategories(): string[] {
  const prompts = loadPrompts();
  return [...new Set(prompts.map(p => p.category))];
}

export function filterPrompts(query: string, category?: string): Prompt[] {
  const q = query.toLowerCase().trim();
  return loadPrompts().filter(p => {
    if (category && p.category !== category) return false;
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
  });
}

export function copyToClipboard(text: string): boolean {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch { return false; }
}
