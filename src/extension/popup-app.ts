import { canAddAnotherChat, countChatsInFolderTree, FREE_CHAT_LIMIT } from './lib/plans';
import type { FolderNode, UserProfile, PremiumSubscription, Bookmark } from '../lib/types';
import LucideIcons from './lib/lucide-icons';

let folders: FolderNode[] = [];
let folderIdCounter = 0;
let currentUser: UserProfile | null = null;
let bookmarks: Bookmark[] = [];

const REDIRECT_URI = chrome.identity.getRedirectURL();

function loadUserFromStorage(): Promise<UserProfile | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['currentUser'], (result: Record<string, any>) => {
      currentUser = result.currentUser || null;
      if (currentUser && (currentUser as any).accessToken) {
        const { accessToken: _t, ...rest } = currentUser as any;
        currentUser = rest as UserProfile;
        chrome.storage.local.set({ currentUser });
      }
      resolve(currentUser);
    });
  });
}

function saveCurrentUser(user: UserProfile): void {
  chrome.storage.local.set({ currentUser: user });
}

function clearCurrentUser(): void {
  chrome.storage.local.remove(['currentUser']);
}

function loadFolders(): void {
  if (!currentUser) {
    folders = [];
    folderIdCounter = 0;
    renderFolders();
    return;
  }

  const key = `folders_${currentUser.id}`;
  const counterKey = `folderIdCounter_${currentUser.id}`;

  chrome.storage.local.get([key, counterKey], (result: Record<string, any>) => {
    folders = result[key] || [];
    folderIdCounter = result[counterKey] || 0;
    renderFolders();
    updateBadge(countChatsInFolderTree(folders));
  });
}

function saveFolders(): void {
  if (!currentUser) return;

  const key = `folders_${currentUser.id}`;
  const counterKey = `folderIdCounter_${currentUser.id}`;
  chrome.storage.local.set({ [key]: folders, [counterKey]: folderIdCounter });
}

function loadBookmarks(): void {
  chrome.storage.local.get(['infolders_bookmarks'], (result: Record<string, any>) => {
    bookmarks = result.infolders_bookmarks || [];
  });
}

function saveBookmarks(): void {
  chrome.storage.local.set({ infolders_bookmarks: bookmarks });
}

function isBookmarked(url: string): boolean {
  return bookmarks.some(b => b.url === url);
}

function toggleBookmark(name: string, url: string, platform: string): void {
  const existing = bookmarks.findIndex(b => b.url === url);
  if (existing >= 0) {
    bookmarks.splice(existing, 1);
    saveBookmarks();
    renderFolders();
    return;
  }
  bookmarks.unshift({ id: Date.now(), name, url, platform, addedAt: new Date().toISOString() });
  saveBookmarks();
  renderFolders();
}

function renderFolders(query = ''): void {
  const container = document.getElementById('folders-container')!;
  container.innerHTML = '';
  const q = query.trim().toLowerCase();
  const filtered = q
    ? folders.filter(function match(f): boolean {
        if (f.name.toLowerCase().includes(q)) return true;
        return (f.subfolders || []).some(match);
      })
    : folders;
  if (filtered.length === 0 && q) {
    container.innerHTML = '<div style="text-align:center;padding:24px 8px;color:rgba(167,139,250,0.5);font-size:12px;">Nessun risultato</div>';
    return;
  }
  filtered.forEach(folder => renderFolder(folder, container));
}

function renderFolder(folder: FolderNode, parentElement: HTMLElement): void {
  const folderDiv = document.createElement('div');
  folderDiv.className = 'folder collapsed';
  folderDiv.dataset.id = String(folder.id);

  const folderItem = document.createElement('div');
  folderItem.className = 'folder-item';

  const expandBtn = document.createElement('button');
  expandBtn.textContent = '📂';
  expandBtn.className = 'expand-btn';
  expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFolder(folder.id);
  });

  const folderName = document.createElement('div');
  folderName.className = 'folder-name';
  folderName.textContent = folder.name;
  folderName.addEventListener('click', () => toggleFolder(folder.id));

  const actions = document.createElement('div');
  actions.className = 'folder-actions';

  const addSubBtn = document.createElement('button');
  addSubBtn.textContent = '+';
  addSubBtn.title = 'Aggiungi sottocartella';
  addSubBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    addSubfolder(folder.id);
  });

  const addChatBtn = document.createElement('button');
  addChatBtn.textContent = '💬';
  addChatBtn.title = 'Aggiungi chat';
  addChatBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    addChatToFolder(folder.id);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.title = 'Elimina cartella';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteFolder(folder.id);
  });

  actions.appendChild(addSubBtn);
  actions.appendChild(addChatBtn);
  actions.appendChild(deleteBtn);

  folderItem.appendChild(expandBtn);
  folderItem.appendChild(folderName);
  folderItem.appendChild(actions);
  folderDiv.appendChild(folderItem);

  const subfoldersDiv = document.createElement('div');
  subfoldersDiv.className = 'subfolders';

  if (folder.subfolders) {
    folder.subfolders.forEach(sub => renderFolder(sub, subfoldersDiv));
  }

  if (folder.chats) {
    folder.chats.forEach((chat, idx) => {
      const chatDiv = document.createElement('div');
      chatDiv.className = 'chat-item';
      chatDiv.draggable = true;
      chatDiv.dataset.folderId = String(folder.id);
      chatDiv.dataset.chatIdx = String(idx);
      const isBm = isBookmarked(chat.url);
      chatDiv.innerHTML = `
        <strong>${escapeHtml(chat.name)}</strong>
        <br><small>${escapeHtml(chat.platform || 'Generico')}</small>
        <div class="chat-actions">
          <button class="bookmark-chat" title="${isBm ? 'Rimuovi dai segnalibri' : 'Aggiungi ai segnalibri'}" style="color:${isBm ? '#fbbf24' : 'rgba(167,139,250,0.5)'};">${isBm ? '★' : '☆'}</button>
          <button class="edit-chat" title="Modifica">✏️</button>
          <button class="delete-chat" title="Elimina">❌</button>
        </div>
      `;

      chatDiv.querySelector('strong')!.addEventListener('click', () => openChat(chat.url));

      chatDiv.querySelector('.bookmark-chat')!.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBookmark(chat.name, chat.url, chat.platform || 'Generico');
      });

      chatDiv.querySelector('.edit-chat')!.addEventListener('click', (e) => {
        e.stopPropagation();
        editChat(folder.id, idx);
      });

      chatDiv.querySelector('.delete-chat')!.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChat(folder.id, idx);
      });

      chatDiv.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/plain', JSON.stringify({ folderId: folder.id, chatIdx: idx }));
        chatDiv.style.opacity = '0.5';
      });
      chatDiv.addEventListener('dragend', () => {
        chatDiv.style.opacity = '1';
      });
      chatDiv.addEventListener('dragover', (e) => {
        e.preventDefault();
        chatDiv.style.borderTop = '2px solid #a855f7';
      });
      chatDiv.addEventListener('dragleave', () => {
        chatDiv.style.borderTop = 'none';
      });
      chatDiv.addEventListener('drop', (e) => {
        e.preventDefault();
        chatDiv.style.borderTop = 'none';
        const data = e.dataTransfer?.getData('text/plain');
        if (!data) return;
        const { folderId: srcFolderId, chatIdx: srcChatIdx } = JSON.parse(data);
        const srcId = Number(srcFolderId);
        const srcIdx = Number(srcChatIdx);
        const dstId = folder.id;
        const dstIdx = idx;
        if (srcId === dstId) return;
        const srcFolder = findFolderById(folders, srcId);
        const dstFolder = findFolderById(folders, dstId);
        if (!srcFolder || !dstFolder || !srcFolder.chats || !dstFolder.chats) return;
        const [movedChat] = srcFolder.chats.splice(srcIdx, 1);
        dstFolder.chats.splice(dstIdx, 0, movedChat);
        saveFolders();
        renderFolders();
      });

      subfoldersDiv.appendChild(chatDiv);
      subfoldersDiv.addEventListener('dragover', (e) => {
        e.preventDefault();
        subfoldersDiv.style.outline = '2px dashed #a855f7';
      });
      subfoldersDiv.addEventListener('dragleave', () => {
        subfoldersDiv.style.outline = 'none';
      });
      subfoldersDiv.addEventListener('drop', (e) => {
        e.preventDefault();
        subfoldersDiv.style.outline = 'none';
        const data = e.dataTransfer?.getData('text/plain');
        if (!data) return;
        const { folderId: srcFolderId, chatIdx: srcChatIdx } = JSON.parse(data);
        const srcId = Number(srcFolderId);
        const srcIdx = Number(srcChatIdx);
        const dstId = folder.id;
        if (srcId === dstId) return;
        const srcFolder = findFolderById(folders, srcId);
        const dstFolder = findFolderById(folders, dstId);
        if (!srcFolder || !dstFolder || !srcFolder.chats || !dstFolder.chats) return;
        const [movedChat] = srcFolder.chats.splice(srcIdx, 1);
        dstFolder.chats.push(movedChat);
        saveFolders();
        renderFolders();
      });
    });
  }

  folderDiv.appendChild(subfoldersDiv);
  parentElement.appendChild(folderDiv);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleFolder(id: number): void {
  const folderDiv = document.querySelector<HTMLElement>(`[data-id="${id}"]`);
  if (folderDiv) {
    folderDiv.classList.toggle('collapsed');
    folderDiv.classList.toggle('expanded');
  }
}

function addRootFolder(): void {
  const name = prompt('Nome della cartella:');
  if (name) {
    const newFolder: FolderNode = {
      id: ++folderIdCounter,
      name,
      subfolders: [],
      chats: []
    };
    folders.push(newFolder);
    saveFolders();
    renderFolders();
    updateBadge(countChatsInFolderTree(folders));
  }
}

function addSubfolder(parentId: number): void {
  const name = prompt('Nome della sottocartella:');
  if (name) {
    const parent = findFolderById(folders, parentId);
    if (parent) {
      const newFolder: FolderNode = {
        id: ++folderIdCounter,
        name,
        subfolders: [],
        chats: []
      };
      parent.subfolders.push(newFolder);
      saveFolders();
      renderFolders();
    }
  }
}

function addChatToFolder(folderId: number): void {
  chrome.storage.local.get(['infolders_premium'], (r: Record<string, any>) => {
    if (!canAddAnotherChat(r.infolders_premium, folders)) {
      alert(
        `Hai raggiunto il limite di ${FREE_CHAT_LIMIT} chat del piano Free. Attiva Pro per chat illimitate dall'icona InFolders.`
      );
      return;
    }
    const name = prompt('Nome della chat:');
    const url = prompt('URL della chat:');
    const platform = prompt('Piattaforma (opzionale):', '') || 'Generico';
    if (name && url) {
      const folder = findFolderById(folders, folderId);
      if (folder) {
        folder.chats.push({ name, url, platform });
        saveFolders();
        renderFolders();
        updateBadge(countChatsInFolderTree(folders));
      }
    }
  });
}

function editChat(folderId: number, chatIdx: number): void {
  const folder = findFolderById(folders, folderId);
  if (!folder || !folder.chats[chatIdx]) return;

  const chat = folder.chats[chatIdx];
  const newName = prompt('Modifica nome chat:', chat.name);
  const newUrl = prompt('Modifica URL chat:', chat.url);
  const newPlatform = prompt('Modifica piattaforma:', chat.platform);

  if (newName) chat.name = newName;
  if (newUrl) chat.url = newUrl;
  if (newPlatform !== null) chat.platform = newPlatform || 'Generico';

  saveFolders();
  renderFolders();
}

function deleteChat(folderId: number, chatIdx: number): void {
  if (!confirm('Eliminare questa chat?')) return;

  const folder = findFolderById(folders, folderId);
  if (!folder) return;

  folder.chats.splice(chatIdx, 1);
  saveFolders();
  renderFolders();
  updateBadge(countChatsInFolderTree(folders));
}

function deleteFolder(id: number): void {
  if (!confirm('Sei sicuro di voler eliminare questa cartella e tutto il suo contenuto?')) return;
  folders = removeFolderById(folders, id);
  saveFolders();
  renderFolders();
  updateBadge(countChatsInFolderTree(folders));
}

function openChat(url: string): void {
  chrome.tabs.create({ url });
}

function findFolderById(foldersArray: FolderNode[], id: number): FolderNode | null {
  for (const folder of foldersArray) {
    if (folder.id === id) return folder;
    if (folder.subfolders) {
      const found = findFolderById(folder.subfolders, id);
      if (found) return found;
    }
  }
  return null;
}

function removeFolderById(foldersArray: FolderNode[], id: number): FolderNode[] {
  return foldersArray.filter(folder => {
    if (folder.id === id) return false;
    if (folder.subfolders) {
      folder.subfolders = removeFolderById(folder.subfolders, id);
    }
    return true;
  });
}

function getAllFoldersList(foldersArray: FolderNode[], prefix = ''): { id: number; name: string }[] {
  let list: { id: number; name: string }[] = [];
  foldersArray.forEach(folder => {
    list.push({ id: folder.id, name: prefix + folder.name });
    if (folder.subfolders) {
      list = list.concat(getAllFoldersList(folder.subfolders, prefix + '  '));
    }
  });
  return list;
}

function moveFolder(id: number): void {
  const folder = findFolderById(folders, id);
  if (!folder) return;

  const allFolders = getAllFoldersList(folders);
  const options = ['0: Root'].concat(allFolders.map(f => `${f.id}: ${f.name}`)).join('\n');
  const targetIdStr = prompt(`Scegli cartella di destinazione (ID) o 0 per root:\n\n${options}`);
  if (targetIdStr === null) return;

  folders = removeFolderById(folders, id);

  const targetId = parseInt(targetIdStr.trim());
  if (targetId === 0) {
    folders.push(folder);
  } else if (targetId && targetId !== id) {
    const target = findFolderById(folders, targetId);
    if (target) {
      target.subfolders.push(folder);
    } else {
      alert('Cartella di destinazione non trovata');
      folders.push(folder);
    }
  } else {
    alert('ID non valido');
    folders.push(folder);
  }

  saveFolders();
  renderFolders();
}

function updateBadge(count: number): void {
  if (count > 0) {
    chrome.action.setBadgeText({ text: String(count > 99 ? '99+' : count) });
    chrome.action.setBadgeBackgroundColor({ color: '#7c3aed' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function exportData(): void {
  if (!currentUser) return;

  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userId: currentUser.id,
    folders: folders,
    folderIdCounter: folderIdCounter
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `infolders_backup_${currentUser.id}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files![0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target!.result as string);
        if (data.userId !== currentUser!.id) {
          alert('Questo backup appartiene a un altro utente');
          return;
        }
        folders = data.folders || [];
        folderIdCounter = data.folderIdCounter || 0;
        saveFolders();
        renderFolders();
        updateBadge(countChatsInFolderTree(folders));
        alert('Backup importato con successo');
      } catch (err) {
        alert('File backup non valido');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function updateAuthUI(): void {
  const loginBtn = document.getElementById('login-btn')!;
  const logoutBtn = document.getElementById('logout-btn')!;
  const userInfo = document.getElementById('user-info')!;
  const foldersSection = document.getElementById('folders-section')!;
  const backupSection = document.getElementById('backup-section')!;

  if (currentUser) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    userInfo.style.display = 'block';
    userInfo.textContent = `👤 ${currentUser.name || currentUser.email}`;
    foldersSection.style.display = 'block';
    backupSection.style.display = 'flex';
    loadFolders();
    loadBookmarks();
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    userInfo.style.display = 'none';
    foldersSection.style.display = 'none';
    backupSection.style.display = 'none';
    folders = [];
    folderIdCounter = 0;
    renderFolders();
    updateBadge(0);
  }
}

function loginWithGoogle(): void {
  const oauth = chrome.runtime.getManifest().oauth2;
  if (!oauth || !oauth.client_id) {
    alert('OAuth non configurato nel manifest.');
    return;
  }
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', oauth.client_id);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
  authUrl.searchParams.set('prompt', 'consent');

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl.toString(),
      interactive: true
    },
    (responseUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Auth error:', chrome.runtime.lastError);
        alert('Errore login: ' + chrome.runtime.lastError.message);
        return;
      }

      try {
        const url = new URL(responseUrl!);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const token = hashParams.get('access_token');

        if (token) {
          fetchUserInfo(token);
        } else {
          alert('Token non ricevuto');
        }
      } catch (e) {
        console.error('Parse error:', e);
        alert('Errore nella risposta OAuth');
      }
    }
  );
}

function fetchUserInfo(token: string): void {
  fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then((user) => {
    currentUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      verified_email: user.verified_email
    };
    saveCurrentUser(currentUser);
    updateAuthUI();
  })
  .catch(error => {
    console.error('Error getting user info:', error);
    alert('Errore recupero info utente');
  });
}

function logout(): void {
  chrome.identity.getAuthToken({ interactive: false }, (result) => {
    if (result?.token) {
      chrome.identity.removeCachedAuthToken({ token: result.token }, () => {
        clearCurrentUser();
        currentUser = null;
        updateAuthUI();
      });
    } else {
      clearCurrentUser();
      currentUser = null;
      updateAuthUI();
    }
  });
}

function checkAuth(): void {
  loadUserFromStorage().then(() => {
    updateAuthUI();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-root-folder')!.addEventListener('click', addRootFolder);
  document.getElementById('login-btn')!.addEventListener('click', loginWithGoogle);
  document.getElementById('logout-btn')!.addEventListener('click', logout);
  document.getElementById('export-btn')!.addEventListener('click', exportData);
  document.getElementById('import-btn')!.addEventListener('click', importData);

  const searchInput = document.getElementById('folders-search') as HTMLInputElement | null;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderFolders(searchInput.value);
    });
  }

  checkAuth();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    loadFolders();
  }
});

window.addEventListener('unload', () => {
  updateBadge(0);
});
