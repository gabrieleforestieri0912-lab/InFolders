import type { FolderNode, PremiumSubscription } from '../lib/types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './lib/config';

const FREE_CHAT_LIMIT = 50;

function isPremiumStorage(value: PremiumSubscription | boolean | null | undefined): boolean {
  if (!value) return false;
  if (value === true) return true;
  if (typeof value !== 'object') return false;
  if (value.premium === true) return true;
  if (value.active === true) return true;
  if (value.active !== false && value.plan && (value.plan === 'pro' || value.plan === 'team')) return true;
  return false;
}

const foldersCache: Record<string, FolderNode[]> = {};
const folderIdCounters: Record<string, number> = {};

function loadAllData(): void {
  chrome.storage.local.get(null, (all: Record<string, any>) => {
    Object.keys(all).forEach(key => {
      if (key.startsWith('folders_')) {
        const uid = key.replace('folders_', '');
        foldersCache[uid] = all[key] as FolderNode[];
      }
      if (key.startsWith('folderIdCounter_')) {
        const uid = key.replace('folderIdCounter_', '');
        folderIdCounters[uid] = all[key] as number;
      }
    });
    console.log('InFolders: Caricati', Object.keys(foldersCache).length, 'utenti');
  });
}

chrome.runtime.onStartup.addListener(loadAllData);
chrome.runtime.onInstalled.addListener(loadAllData);
loadAllData();

chrome.runtime.onMessage.addListener((req, sender, respond) => {
  switch (req.action) {
    case 'addChat':
      handleAddChat(req.chat).then(() => {
        updateBadge();
        respond({ success: true });
      }).catch(err => respond({ success: false, error: err.message }));
      return true;

    case 'getFolders':
      handleGetFolders(respond);
      return true;

    case 'saveFolders':
      handleSaveFolders(req.userId, req.folders, req.counter);
      respond({ success: true });
      return true;

    case 'getBookmarks':
      chrome.storage.local.get(['infolders_bookmarks'], (res: Record<string, any>) => {
        respond({ bookmarks: res.infolders_bookmarks || [] });
      });
      return true;

    case 'saveBookmarks':
      chrome.storage.local.set({ infolders_bookmarks: req.bookmarks }, () => {
        respond({ success: true });
      });
      return true;

    case 'loginWithGoogle':
      handleGoogleLogin().then(token => respond({ token })).catch(err => respond({ error: err.message }));
      return true;

    case 'logout':
      handleLogout().then(() => respond({ success: true })).catch(err => respond({ error: err.message }));
      return true;

    case 'supabaseAuth':
      // Proxy auth Supabase dal service worker (qui i fetch cross-origin funzionano).
      handleSupabaseAuth(req.op, req.body)
        .then(data => respond({ data }))
        .catch(err => respond({ error: err.message }));
      return true;

  }
});

async function handleSupabaseAuth(op: string, body: any): Promise<any> {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
  // Aggiungo il Bearer dell'utente se presente in storage.
  const stored = await chrome.storage.local.get(['supabase_session']) as { supabase_session?: { access_token?: string } };
  const accessToken = stored?.supabase_session?.access_token;
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = op === 'signInWithIdToken'
    ? `${SUPABASE_URL}/auth/v1/token?grant_type=id_token`
    : `${SUPABASE_URL}/auth/v1/${op}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let payload: any;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = { raw: text }; }

  if (!res.ok) {
    const msg = payload?.msg || payload?.error_description || payload?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // Salvo la sessione in storage per riusarla lato service worker.
  if (payload?.access_token && payload?.refresh_token) {
    await chrome.storage.local.set({ supabase_session: payload });
  }
  if (op === 'logout') {
    await chrome.storage.local.remove(['supabase_session']);
  }

  return payload;
}

function handleGoogleLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (result: any) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      const token = typeof result === 'string' ? result : result?.token;
      if (token) resolve(token);
      else reject(new Error('Nessun token ricevuto'));
    });
  });
}

function handleLogout(): Promise<void> {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (result) => {
      if (result?.token) {
        chrome.identity.removeCachedAuthToken({ token: result.token }, () => {
          chrome.storage.local.remove(['currentUser'], () => resolve());
        });
      } else {
        chrome.storage.local.remove(['currentUser'], () => resolve());
      }
    });
  });
}

function handleAddChat(chat: { name: string; url: string; platform: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['currentUser', 'infolders_premium'], (res: Record<string, any>) => {
      const user = res.currentUser;
      if (!user) return reject(new Error('Accedi per aggiungere chat alle cartelle.'));

      const uid = user.id;
      const list = foldersCache[uid] || [];
      const counter = folderIdCounters[uid] || 0;

      if (!isPremiumStorage(res.infolders_premium) && countChats(list) >= FREE_CHAT_LIMIT) {
        return reject(
          new Error(`Limite ${FREE_CHAT_LIMIT} chat (piano Free). Attiva Pro per chat illimitate.`)
        );
      }

      const platform = chat.platform || 'Generico';
      let folder = list.find((f: FolderNode) => f.name === platform);

      if (!folder) {
        let newCounter = counter;
        folder = { id: ++newCounter, name: platform, subfolders: [], chats: [] };
        list.push(folder);
        folderIdCounters[uid] = newCounter;
      }

      folder.chats.push(chat);
      foldersCache[uid] = list;

      chrome.storage.local.set(
        {
          [`folders_${uid}`]: list,
          [`folderIdCounter_${uid}`]: folderIdCounters[uid]
        },
        () => resolve()
      );
    });
  });
}

function handleGetFolders(sendResponse: (response: any) => void): void {
  chrome.storage.local.get(['currentUser'], (res: Record<string, any>) => {
    const user = res.currentUser;
    if (!user) {
      sendResponse({ folders: [], counter: 0 });
      return;
    }
    const uid = user.id;
    sendResponse({
      folders: foldersCache[uid] || [],
      counter: folderIdCounters[uid] || 0
    });
  });
}

function handleSaveFolders(uid: string, list: FolderNode[], counter: number): void {
  foldersCache[uid] = list;
  folderIdCounters[uid] = counter;
  chrome.storage.local.set({
    [`folders_${uid}`]: list,
    [`folderIdCounter_${uid}`]: counter
  });
}

function countChats(folderList: FolderNode[]): number {
  let total = 0;
  function walk(list: FolderNode[]) {
    list.forEach(f => {
      total += f.chats?.length || 0;
      if (f.subfolders) walk(f.subfolders);
    });
  }
  walk(folderList);
  return total;
}

function updateBadge(): void {
  chrome.storage.local.get(['currentUser'], (res: Record<string, any>) => {
    const user = res.currentUser;
    if (!user) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }
    const total = countChats(foldersCache[user.id] || []);
    if (total > 0) {
      chrome.action.setBadgeText({ text: String(total > 99 ? '99+' : total) });
      chrome.action.setBadgeBackgroundColor({ color: '#7c3aed' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

chrome.runtime.onStartup.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});
