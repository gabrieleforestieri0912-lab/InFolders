import type { FolderNode, PremiumSubscription } from '../../lib/types';

export const FREE_CHAT_LIMIT = 50;

export function isPremiumFromStorage(value: PremiumSubscription | boolean | null | undefined): boolean {
  if (!value) return false;
  if (value === true) return true;
  if (typeof value !== 'object') return false;
  if (value.premium === true) return true;
  if (value.active === true) return true;
  if (value.active !== false && value.plan && (value.plan === 'pro' || value.plan === 'team')) return true;
  return false;
}

export function countChatsInFolderTree(nodes: FolderNode[]): number {
  if (!nodes || !nodes.length) return 0;
  let n = 0;
  for (const f of nodes) {
    n += f.chats ? f.chats.length : 0;
    if (f.subfolders && f.subfolders.length) n += countChatsInFolderTree(f.subfolders);
  }
  return n;
}

export function canAddAnotherChat(premiumRecord: PremiumSubscription | boolean | null | undefined, folderTree: FolderNode[], chatsToAdd: number = 1): boolean {
  if (isPremiumFromStorage(premiumRecord)) return true;
  const currentCount = countChatsInFolderTree(folderTree);
  return (currentCount + chatsToAdd) <= FREE_CHAT_LIMIT;
}

export function buildProSubscription(plan: 'pro' | 'team', price?: string): PremiumSubscription {
  const startDate = new Date().toISOString();
  return {
    premium: true,
    plan,
    price: price || '',
    active: true,
    startDate,
    trialEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

export function filterFolderTreeByQuery(nodes: FolderNode[], query: string): FolderNode[] {
  const q = (query || '').trim().toLowerCase();
  if (!q) return nodes || [];
  function walk(folders: FolderNode[]): FolderNode[] {
    const out: FolderNode[] = [];
    for (const f of folders || []) {
      const nameMatch = (f.name || '').toLowerCase().includes(q);
      const sub = walk(f.subfolders || []);
      const anyChatMatch = (f.chats || []).some((c) => (c.name || '').toLowerCase().includes(q));
      if (nameMatch || anyChatMatch || sub.length) {
        let chatsOut = f.chats || [];
        if (anyChatMatch && !nameMatch) {
          chatsOut = chatsOut.filter((c) => (c.name || '').toLowerCase().includes(q));
        }
        out.push({ ...f, chats: chatsOut, subfolders: sub });
      }
    }
    return out;
  }
  return walk(nodes || []);
}
