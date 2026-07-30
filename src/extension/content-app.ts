import LucideIcons from './lib/lucide-icons';
import { getPlatformConfig } from './lib/platform-config';
import {
  isPremiumFromStorage,
  countChatsInFolderTree,
  FREE_CHAT_LIMIT,
  filterFolderTreeByQuery,
  canAddAnotherChat
} from './lib/plans';
import { t, initLanguage } from './lib/i18n';
import type { PlatformConfig, PlatformTheme, FolderNode, Bookmark, UserProfile, PremiumSubscription, TabId, ToastType, Prompt, InstructionProfile } from '../lib/types';
import { syncUserData, saveUserData } from '../lib/data-service';
import { initSupabase, signInWithGoogleToken } from '../lib/supabase';
import { createCheckoutSession, sendTeamContact } from './lib/api';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './lib/config';
import {
  loadPrompts, savePrompts, addPrompt, deletePrompt, filterPrompts, copyToClipboard
} from './lib/prompts';
import {
  loadProfiles, saveProfiles, addProfile, deleteProfile, getActiveProfile, setActiveProfile, clearActiveProfile
} from './lib/instruction-profiles';
import { PLANS } from '../lib/plans-config';

let currentTheme: PlatformTheme | null = null;
let currentPlatform: PlatformConfig | null = null;
let isSidebarOpen = false;
let currentUser: UserProfile | null = null;
let bookmarks: Bookmark[] = [];
let folders: FolderNode[] = [];
let folderIdCounter = 0;
let infoldersPremium: PremiumSubscription | null = null;
let folderSearchQuery = '';
const folderUrlMap = new Map<string, { folderName: string; folderColor: string }>();

function getFolderColors(): string[] {
  if (!currentPlatform) {
    return ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#a855f7', '#14b8a6', '#f97316'];
  }
  const name = currentPlatform.name.toLowerCase();
  if (name.includes('chatgpt')) {
    return ['#a855f7', '#000000'];
  }
  if (name.includes('gemini')) {
    return ['#60a5fa', '#000000'];
  }
  if (name.includes('claude')) {
    return ['#fb923c', '#000000'];
  }
  if (name.includes('perplexity')) {
    return ['#22c55e', '#000000'];
  }
  return [currentPlatform.theme.primary, '#000000'];
}

function sanitizeColor(color: string | undefined): string {
  const allowed = getFolderColors();
  if (color && allowed.includes(color)) {
    return color;
  }
  return allowed[0];
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.origin + u.pathname.replace(/\/+$/, '') + u.search;
  } catch {
    return url.replace(/\/+$/, '');
  }
}

function buildFolderUrlMap(): void {
  folderUrlMap.clear();
  function walk(nodes: FolderNode[]) {
    for (const f of nodes) {
      const fc = sanitizeColor(f.color);
      for (const c of f.chats || []) {
        folderUrlMap.set(normalizeUrl(c.url), { folderName: f.name, folderColor: fc });
      }
      if (f.subfolders) walk(f.subfolders);
    }
  }
  walk(folders);
}

function premiumActive(): boolean {
  return isPremiumFromStorage(infoldersPremium);
}

function showToast(message: string, type: ToastType = 'info', duration: number = 3000): void {
  let container = document.getElementById('infolders-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'infolders-toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '2147483647',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    });
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const theme = currentTheme!;

  let icon: string, bgColor: string, borderColor: string;
  switch (type) {
    case 'success':
      icon = LucideIcons.get('check-circle', 16);
      bgColor = `${theme.primary}25`;
      borderColor = theme.primary;
      break;
    case 'error':
      icon = LucideIcons.get('alert-circle', 16);
      bgColor = 'rgba(239, 68, 68, 0.15)';
      borderColor = '#ef4444';
      break;
    case 'warning':
      icon = LucideIcons.get('alert-triangle', 16);
      bgColor = 'rgba(245, 158, 11, 0.15)';
      borderColor = '#f59e0b';
      break;
    default:
      icon = LucideIcons.get('info', 16);
      bgColor = `${theme.primary}20`;
      borderColor = theme.primary;
  }

  Object.assign(toast.style, {
    background: theme.glassBg || bgColor,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${borderColor}`,
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'white',
    minWidth: '250px',
    maxWidth: '350px',
    boxShadow: `0 8px 32px rgba(0,0,0,0.4), ${theme.buttonGlow}`,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    lineHeight: '1.4',
    opacity: '0',
    transform: 'translateX(100%) scale(0.95)',
    transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
  });

  toast.innerHTML = `<span style="display:flex;align-items:center;color:${borderColor};">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0) scale(1)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%) scale(0.95)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

async function startStripeCheckout(plan: 'pro' | 'team'): Promise<void> {
  if (!currentUser) {
    showToast('Accedi prima di procedere al pagamento.', 'warning');
    return;
  }

  try {
    showToast('Reindirizzamento a Stripe...', 'info', 3000);
    const checkoutUrl = await createCheckoutSession(plan, currentUser.id, currentUser.email);
    window.open(checkoutUrl, '_blank');
  } catch (err: any) {
    showToast(err.message || 'Errore nel pagamento. Riprova più tardi.', 'warning');
  }
}

function isChatUrl(): boolean {
  const host = window.location.hostname;
  const path = window.location.pathname;
  switch (host) {
    case 'chatgpt.com':
    case 'chat.openai.com':
      return /^\/c\//.test(path);
    case 'claude.ai':
      return path === '/new' || /^\/chat\//.test(path);
    case 'gemini.google.com':
      return /^\/app\//.test(path);
    case 'perplexity.ai':
    case 'www.perplexity.ai':
      return /^\/(search|thread|library)\//.test(path);
    default:
      return false;
  }
}

function init(): void {
  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    const config = getPlatformConfig();
    if (!config) return;

    currentTheme = config.theme;
    currentPlatform = config;
    initLanguage(() => {
      injectUI();
      loadUserAndBookmarks();
      loadFoldersFromBackground();
      syncPremiumStatusFromSupabase();
    });
  } catch (e) {
    console.warn('InFolders init:', e);
  }
}

function updateInPageButtonsPosition(): void {
  const container = document.getElementById('infolders-inpage-buttons');
  if (!container) return;
  const isRight = currentPlatform ? currentPlatform.sidebarPosition === 'right' : true;
  if (isRight) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    container.style.right = `${16 + Math.max(0, scrollbarWidth)}px`;
    container.style.left = 'auto';
  } else {
    container.style.left = '16px';
    container.style.right = 'auto';
  }
}

function hideInPageButtons(): void {
  const container = document.getElementById('infolders-inpage-buttons');
  if (container) {
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.transform = 'scale(0.9)';
  }
}

function showInPageButtons(): void {
  const container = document.getElementById('infolders-inpage-buttons');
  if (container) {
    container.style.opacity = '1';
    container.style.pointerEvents = 'auto';
    container.style.transform = 'scale(1)';
    updateInPageButtonsPosition();
  }
}

function createRoundButton(id: string, iconName: string, title: string, theme: PlatformTheme): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.id = id;
  btn.title = title;
  Object.assign(btn.style, {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: theme.glassBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `2px solid ${theme.appAccent}`,
    color: theme.appAccent,
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${theme.appAccent}33`
  });
  btn.appendChild(LucideIcons.element(iconName, 20));
  btn.addEventListener('mouseenter', () => {
    btn.style.background = theme.surface;
    btn.style.borderColor = theme.appAccent;
    btn.style.color = '#fff';
    btn.style.transform = 'translateY(-3px) scale(1.06)';
    btn.style.boxShadow = `0 8px 28px rgba(0,0,0,0.5), 0 0 18px ${theme.appAccent}55`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = theme.glassBg;
    btn.style.borderColor = theme.appAccent;
    btn.style.color = theme.appAccent;
    btn.style.transform = 'translateY(0) scale(1)';
    btn.style.boxShadow = `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${theme.appAccent}33`;
  });
  return btn;
}

function injectUI(): void {
  const theme = currentTheme!;
  const isRight = currentPlatform!.sidebarPosition === 'right';
  const container = document.createElement('div');
  container.id = 'infolders-inpage-buttons';
  Object.assign(container.style, {
    position: 'fixed',
    top: '100px',
    [isRight ? 'right' : 'left']: '28px',
    zIndex: '2147483647',
    display: 'flex',
    gap: '10px',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    direction: 'ltr',
    textAlign: 'left'
  });

  const sidebarBtn = createRoundButton('infolders-sidebar-toggle', 'folder', t('button.open.sidebar'), theme);
  sidebarBtn.addEventListener('click', toggleSidebar);

  const premiumBtn = createRoundButton('infolders-premium-toggle', 'crown', 'Premium', theme);
  premiumBtn.addEventListener('click', openPremiumPopup);

  const guideBtn = createRoundButton('infolders-guide-toggle', 'help-circle', 'Guida', theme);
  guideBtn.addEventListener('click', () => { startGuidedTour(); });

  container.appendChild(sidebarBtn);
  container.appendChild(premiumBtn);
  container.appendChild(guideBtn);
  document.body.appendChild(container);

  updateInPageButtonsPosition();
  window.addEventListener('resize', updateInPageButtonsPosition);
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      updateInPageButtonsPosition();
    });
    ro.observe(document.documentElement);
  }
}

function scheduleAutoOpenSidebarForGuest(): void {
  setTimeout(() => {
    if (currentUser) return;
    if (!getPlatformConfig()) return;
    if (isSidebarOpen) return;
    openSidebar();
  }, 450);
}

function toggleSidebar(): void {
  isSidebarOpen ? closeSidebar() : openSidebar();
}

function openSidebar(): void {
  if (isSidebarOpen) return;
  isSidebarOpen = true;
  hideInPageButtons();

  const theme = currentTheme!;
  const isRight = currentPlatform!.sidebarPosition === 'right';

  const overlay = document.createElement('div');
  overlay.id = 'infolders-sidebar-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: '2147483645',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  });

  const sidebar = document.createElement('div');
  sidebar.id = 'infolders-sidebar';
  Object.assign(sidebar.style, {
    position: 'fixed',
    top: '0',
    [isRight ? 'right' : 'left']: '0',
    width: '352px',
    height: '100vh',
    background: theme.bg,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderLeft: isRight ? `1px solid ${theme.glassBorder}` : 'none',
    borderRight: !isRight ? `1px solid ${theme.glassBorder}` : 'none',
    boxShadow: `0 0 40px rgba(0,0,0,0.5), ${isRight ? '-4px 0 60px ' : '4px 0 60px '}${theme.appAccent}22`,
    zIndex: '2147483646',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: theme.textPrimary,
    transition: `transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)`,
    transform: isRight ? 'translateX(100%)' : 'translateX(-100%)',
    direction: 'ltr',
    textAlign: 'left'
  });

  const header = document.createElement('div');
  header.className = 'infolders-sidebar-header';
  Object.assign(header.style, {
    background: `${theme.glassBg}`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '14px 16px',
    borderBottom: `1px solid ${theme.glassBorder}`,
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  });

  const tabsContainer = document.createElement('div');
  tabsContainer.setAttribute('data-tab-bar', '');
  Object.assign(tabsContainer.style, {
    display: 'flex',
    gap: '4px',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '4px',
    borderRadius: '12px',
    flex: '1',
    alignItems: 'center',
    marginRight: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    overflow: 'hidden'
  });

  const allTabs: { id: TabId; icon: string }[] = [
    { id: 'account', icon: 'user' },
    { id: 'folders', icon: 'folder' },
    { id: 'bookmarks', icon: 'bookmark' },
    { id: 'prompts', icon: 'file-text' },
    { id: 'profiles', icon: 'user-check' },
    { id: 'tools', icon: 'settings' },
  ];

  const tabLabels: Record<TabId, string> = {
    account: t('sidebar.account') || 'Account',
    folders: t('sidebar.folders') || 'Cartelle',
    bookmarks: t('sidebar.bookmarks') || 'Bookmark',
    prompts: 'Prompt',
    profiles: 'Profili',
    tools: t('sidebar.tools') || 'Impostazioni',
  };

  allTabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.dataset.tab = tab.id;
    btn.title = tabLabels[tab.id] || tab.id;
    btn.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;flex-shrink:0;">${LucideIcons.get(tab.icon, 16)}</span><span class="tab-label" style="opacity:0;max-width:0px;overflow:hidden;white-space:nowrap;transition:all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);font-size:11px;font-weight:700;line-height:1;margin-left:0px;">${tabLabels[tab.id]}</span>`;

    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
        btn.style.color = theme.textPrimary;
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = 'transparent';
        btn.style.color = theme.textSecondary;
      }
    });
    btn.addEventListener('click', () => switchTab(tab.id));
    tabsContainer.appendChild(btn);
  });

  if (!currentUser) tabsContainer.style.display = 'none';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.title = t('sidebar.close');
  closeBtn.innerHTML = LucideIcons.get('x', 18);
  const closeSvg = closeBtn.querySelector('svg');
  if (closeSvg) closeSvg.style.pointerEvents = 'none';
  Object.assign(closeBtn.style, {
    background: 'transparent',
    border: 'none',
    color: theme.textSecondary,
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    marginLeft: '4px'
  });
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = theme.surface;
    closeBtn.style.color = theme.appAccent;
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'transparent';
    closeBtn.style.color = theme.textSecondary;
  });
  closeBtn.addEventListener('click', closeSidebar);

  header.appendChild(tabsContainer);
  header.appendChild(closeBtn);
  sidebar.appendChild(header);

  const content = document.createElement('div');
  content.id = 'infolders-sidebar-content';
  Object.assign(content.style, {
    flex: '1',
    overflowY: 'auto',
    padding: '16px 14px',
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.border} transparent`
  });

  renderAccountTab(content);
  sidebar.appendChild(content);

  overlay.appendChild(sidebar);
  document.body.appendChild(overlay);

  updateTabStyles('account');

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSidebar();
  });

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    sidebar.style.transform = 'translateX(0)';
  });
}

let _reopeningSidebar = false;

function closeSidebar(): void {
  const sidebar = document.getElementById('infolders-sidebar');
  const overlay = document.getElementById('infolders-sidebar-overlay');
  const isRight = currentPlatform!.sidebarPosition === 'right';

  if (overlay) overlay.style.opacity = '0';
  if (sidebar) {
    sidebar.style.transform = isRight ? 'translateX(100%)' : 'translateX(-100%)';
  }

  setTimeout(() => {
    if (sidebar) sidebar.remove();
    if (overlay) overlay.remove();
    isSidebarOpen = false;
    if (!_reopeningSidebar) showInPageButtons();
  }, 350);
}

function rebuildTabBar(): void {
  const tabsContainer = document.querySelector<HTMLElement>('[data-tab-bar]');
  if (!tabsContainer) return;

  const loggedIn = !!currentUser;
  const isHidden = tabsContainer.style.display === 'none';
  if (loggedIn === !isHidden) return;

  if (!loggedIn) {
    tabsContainer.style.display = 'none';
    return;
  }

  tabsContainer.style.display = 'flex';
  tabsContainer.innerHTML = '';

  const allTabs: { id: TabId; icon: string }[] = [
    { id: 'account', icon: 'user' },
    { id: 'folders', icon: 'folder' },
    { id: 'bookmarks', icon: 'bookmark' },
    { id: 'prompts', icon: 'file-text' },
    { id: 'profiles', icon: 'user-check' },
    { id: 'tools', icon: 'settings' },
  ];
  const theme = currentTheme!;
  const tabLabels: Record<TabId, string> = {
    account: 'Account',
    folders: 'Cartelle',
    bookmarks: 'Bookmark',
    prompts: 'Prompt',
    profiles: 'Profili',
    tools: 'Impostazioni',
  };
  allTabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.dataset.tab = tab.id;
    btn.title = tabLabels[tab.id] || tab.id;
    btn.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;flex-shrink:0;">${LucideIcons.get(tab.icon, 16)}</span><span class="tab-label" style="opacity:0;max-width:0px;overflow:hidden;white-space:nowrap;transition:all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);font-size:11px;font-weight:700;line-height:1;margin-left:0px;">${tabLabels[tab.id]}</span>`;
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
        btn.style.color = theme.textPrimary;
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = 'transparent';
        btn.style.color = theme.textSecondary;
      }
    });
    btn.addEventListener('click', () => switchTab(tab.id));
    tabsContainer.appendChild(btn);
  });
}

function updateTabStyles(activeTabId: TabId): void {
  const theme = currentTheme!;
  document.querySelectorAll<HTMLElement>('#infolders-sidebar button[data-tab]').forEach(btn => {
    const tabId = btn.dataset.tab as TabId;
    const isActive = tabId === activeTabId;
    btn.classList.toggle('active', isActive);

    Object.assign(btn.style, {
      background: isActive ? theme.surface : 'transparent',
      color: isActive ? theme.appAccent : theme.textSecondary,
      padding: isActive ? '6px 10px' : '6px 6px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isActive ? '6px' : '0px',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      outline: 'none',
      boxShadow: isActive ? `0 4px 12px rgba(0,0,0,0.15), 0 0 8px ${theme.appAccent}22` : 'none',
      transform: isActive ? 'scale(1.02)' : 'scale(1)',
      flex: isActive ? '2' : '1',
      minWidth: isActive ? '76px' : '32px',
      maxWidth: isActive ? '110px' : '32px',
      height: '32px',
      boxSizing: 'border-box',
      overflow: 'hidden'
    });

    const label = btn.querySelector<HTMLElement>('.tab-label');
    if (label) {
      Object.assign(label.style, {
        opacity: isActive ? '1' : '0',
        maxWidth: isActive ? '110px' : '0px',
        marginLeft: isActive ? '4px' : '0px'
      });
    }
  });
}

function switchTab(tabId: TabId): void {
  if (!currentUser && tabId !== 'account') {
    tabId = 'account';
  }
  const content = document.getElementById('infolders-sidebar-content');
  if (!content) return;

  updateTabStyles(tabId);

  content.innerHTML = '';
  switch (tabId) {
    case 'account': renderAccountTab(content); break;
    case 'tools': renderToolsTab(content); break;
    case 'folders': renderFoldersTab(content); break;
    case 'bookmarks': renderBookmarksTab(content); break;
    case 'prompts': renderPromptsTab(content); break;
    case 'profiles': renderProfilesTab(content); break;
  }
}

function renderAccountTab(container: HTMLElement): void {
  const theme = currentTheme!;
  if (!currentUser) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:40px 16px 24px;text-align:center;">
        <div style="display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:${theme.appAccent};">${LucideIcons.get('user', 48)}</div>
        <h3 style="margin:0 0 6px;font-size:17px;font-weight:700;color:${theme.textPrimary};letter-spacing:-0.3px;">Benvenuto in InFolders</h3>
        <p style="margin:0 0 28px;color:${theme.textSecondary};font-size:13px;line-height:1.5;max-width:220px;">${t('auth.login.title')}</p>
        <button id="sidebar-login-btn" style="background:${theme.appAccent};border:none;color:white;padding:12px 28px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:700;transition:all 0.2s ease;letter-spacing:0.2px;box-shadow:0 4px 20px ${theme.appAccent}44;width:100%;max-width:220px;">${t('auth.login.button')}</button>
      </div>
    `;
    container.querySelector('#sidebar-login-btn')!.addEventListener('click', loginWithGoogle);
  } else {
    const premiumBadge = premiumActive()
      ? `<span style="background:${theme.appAccent}22;color:${theme.appAccent};border:1px solid ${theme.appAccent}44;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Premium</span>`
      : `<span style="background:rgba(255,255,255,0.06);color:${theme.textSecondary};border:1px solid rgba(255,255,255,0.08);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Free</span>`;
    container.innerHTML = `
      <div style="padding:8px 0 16px;">
        <div style="display:flex;align-items:center;gap:14px;padding:16px;background:${theme.surface};border:1px solid ${theme.border};border-radius:16px;margin-bottom:16px;">
          <div style="width:52px;height:52px;border-radius:14px;background:${theme.appAccent}18;border:2px solid ${theme.appAccent}33;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">${currentUser.picture ? `<img src="${escapeHtml(currentUser.picture)}" alt="" style="width:100%;height:100%;object-fit:cover;" />` : `<span style="color:${theme.appAccent};">${LucideIcons.get('user', 24)}</span>`}</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-weight:700;font-size:14px;color:${theme.textPrimary};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(currentUser.name || 'Utente')}</span>
              ${premiumBadge}
            </div>
            <p style="margin:0;color:${theme.textSecondary};font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(currentUser.email)}</p>
          </div>
        </div>
        <button id="sidebar-logout-btn" style="background:transparent;border:1px solid rgba(239,68,68,0.25);color:rgba(239,68,68,0.7);padding:10px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.2s ease;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;">${LucideIcons.get('log-out', 14)} Disconnetti account</button>
      </div>
    `;
    container.querySelector('#sidebar-logout-btn')!.addEventListener('click', logout);
  }
}

function renderToolsTab(container: HTMLElement): void {
  const theme = currentTheme!;
  const mkBtn = (id: string, icon: string, label: string, sub: string, danger = false) => `
    <button id="${id}" style="background:${danger ? 'rgba(239,68,68,0.06)' : theme.surface};border:1px solid ${danger ? 'rgba(239,68,68,0.2)' : theme.border};color:${danger ? '#f87171' : theme.textPrimary};padding:14px 16px;border-radius:14px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:14px;font-size:13px;font-weight:500;transition:all 0.2s ease;width:100%;">
      <span style="width:36px;height:36px;border-radius:10px;flex-shrink:0;background:${danger ? 'rgba(239,68,68,0.12)' : `${theme.appAccent}15`};display:flex;align-items:center;justify-content:center;color:${danger ? '#f87171' : theme.appAccent};">${LucideIcons.get(icon, 18)}</span>
      <span style="display:flex;flex-direction:column;gap:2px;">
        <span style="font-weight:600;font-size:13px;">${label}</span>
        <span style="color:${theme.textSecondary};font-size:11px;font-weight:400;">${sub}</span>
      </span>
    </button>
  `;
  container.innerHTML = `
    <div style="padding:0 0 8px;">
      <p style="color:${theme.textSecondary};font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:0 0 14px;padding:0 2px;">Gestione Dati</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${mkBtn('tool-export', 'upload', 'Esporta dati', 'Scarica un backup JSON', false)}
        ${mkBtn('tool-import', 'download', 'Importa dati', 'Ripristina da backup', false)}
        ${mkBtn('tool-clear', 'trash2', 'Cancella tutto', 'Rimuove tutti i tuoi dati', true)}
      </div>
    </div>
  `;
  container.querySelector('#tool-export')!.addEventListener('click', exportData);
  container.querySelector('#tool-import')!.addEventListener('click', importData);
  container.querySelector('#tool-clear')!.addEventListener('click', clearAllData);
}

function renderFoldersTab(container: HTMLElement): void {
  const theme = currentTheme!;
  container.innerHTML = `
    <div style="padding:0 0 8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <p style="color:${theme.textSecondary};font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:0;">Cartelle</p>
        <button id="sidebar-add-folder" style="background:${theme.appAccent};border:none;color:white;padding:6px 14px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;letter-spacing:0.2px;transition:all 0.2s ease;box-shadow:0 2px 10px ${theme.appAccent}33;">${LucideIcons.get('plus', 12)} Nuova</button>
      </div>
      <div style="position:relative;margin-bottom:12px;">
        <span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:${theme.textSecondary};pointer-events:none;display:flex;">${LucideIcons.get('search', 13)}</span>
        <input type="search" id="sidebar-folder-search" placeholder="Cerca cartelle..." style="width:100%;box-sizing:border-box;padding:9px 12px 9px 33px;border-radius:10px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:12px;outline:none;transition:border-color 0.2s ease;">
      </div>
      <div id="sidebar-folders-list"></div>
    </div>
  `;
  container.querySelector('#sidebar-add-folder')!.addEventListener('click', addRootFolderFromSidebar);
  const searchEl = container.querySelector<HTMLInputElement>('#sidebar-folder-search')!;
  searchEl.addEventListener('input', () => {
    folderSearchQuery = searchEl.value;
    renderFoldersList(container);
  });
  searchEl.addEventListener('focus', function (this: HTMLInputElement) { this.style.borderColor = theme.appAccent; });
  searchEl.addEventListener('blur', function (this: HTMLInputElement) { this.style.borderColor = theme.border; });
  renderFoldersList(container);
}

function renderFoldersList(container: HTMLElement): void {
  const list = container.querySelector<HTMLElement>('#sidebar-folders-list');
  if (!list) return;
  list.innerHTML = '';
  const q = (folderSearchQuery || '').trim();
  const tree = q ? filterFolderTreeByQuery(folders, q) : folders;
  if (tree.length === 0 && q) {
    list.innerHTML = `<div style="text-align:center;padding:32px 16px;"><span style="color:${currentTheme!.textSecondary};font-size:13px;">Nessun risultato per "${escapeHtml(q)}"</span></div>`;
    return;
  }
  tree.forEach((folder) => {
    list.appendChild(createFolderElement(folder, list, 0));
  });
}

function isEmojiString(str: string): boolean {
  return /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/.test(str);
}

function getFolderIconElement(folder: FolderNode, isExpanded: boolean, color: string): HTMLElement | SVGElement {
  const iconName = folder.icon || (isExpanded ? 'folder-open' : 'folder');
  if (isEmojiString(iconName)) {
    const span = document.createElement('span');
    span.textContent = iconName;
    span.style.cssText = 'font-size:14px;margin-right:2px;display:inline-block;line-height:1;';
    return span;
  }
  return LucideIcons.element(iconName, 15);
}

function createFolderElement(folder: FolderNode, parent: HTMLElement, depth: number): HTMLElement {
  const theme = currentTheme!;
  const folderColor = sanitizeColor(folder.color);
  const effectiveColor = folderColor === '#000000' ? 'rgba(255,255,255,0.7)' : folderColor;
  const folderDiv = document.createElement('div');
  folderDiv.style.marginLeft = `${depth * 14}px`;
  folderDiv.style.marginBottom = '5px';

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 10px',
    background: depth === 0 ? theme.surface : 'rgba(255,255,255,0.03)',
    borderRadius: '11px',
    border: `1px solid ${theme.border}`,
    borderLeft: `3px solid ${effectiveColor}`,
    transition: 'all 0.18s ease',
    cursor: 'pointer'
  });
  header.addEventListener('mouseenter', () => {
    header.style.background = theme.surfaceHover;
    header.style.borderColor = `${effectiveColor}55`;
    header.style.borderLeftColor = effectiveColor;
  });
  header.addEventListener('mouseleave', () => {
    header.style.background = depth === 0 ? theme.surface : 'rgba(255,255,255,0.03)';
    header.style.borderColor = theme.border;
    header.style.borderLeftColor = effectiveColor;
  });

  const expandBtn = document.createElement('button');
  expandBtn.title = folder.subfolders && folder.subfolders.length ? 'Espandi' : 'Apri';
  expandBtn.style.cssText = `background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;color:${effectiveColor};flex-shrink:0;`;

  const updateExpandBtnIcon = () => {
    expandBtn.innerHTML = '';
    const isExpanded = folderDiv.classList.contains('expanded');
    expandBtn.appendChild(getFolderIconElement(folder, isExpanded, effectiveColor));
  };
  updateExpandBtnIcon();

  expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    folderDiv.classList.toggle('expanded');
    const sub = folderDiv.querySelector('.subfolders') as HTMLElement;
    if (sub) sub.style.display = folderDiv.classList.contains('expanded') ? 'block' : 'none';
    updateExpandBtnIcon();
  });

  const nameSpan = document.createElement('span');
  nameSpan.textContent = folder.name;
  Object.assign(nameSpan.style, {
    flex: '1', cursor: 'pointer', color: theme.textPrimary,
    fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis'
  });
  nameSpan.addEventListener('click', (e) => {
    e.stopPropagation();
    showFolderDialog('Rinomina cartella', folder.name, sanitizeColor(folder.color), 'Salva', (name, color) => {
      folder.name = name;
      folder.color = color;
      saveFolders();
      const c = document.getElementById('infolders-sidebar-content');
      if (c) renderFoldersList(c);
    });
  });

  if (folder.chats && folder.chats.length > 0) {
    const badge = document.createElement('span');
    badge.textContent = String(folder.chats.length);
    Object.assign(badge.style, {
      background: `${effectiveColor}22`, color: effectiveColor,
      fontSize: '10px', fontWeight: '700', padding: '1px 6px',
      borderRadius: '20px', flexShrink: '0', border: `1px solid ${effectiveColor}33`
    });
    header.appendChild(badge);
  }

  const actionsDiv = document.createElement('div');
  Object.assign(actionsDiv.style, {
    display: 'flex', gap: '2px', opacity: '0', transition: 'opacity 0.15s ease', flexShrink: '0'
  });
  header.addEventListener('mouseenter', () => { actionsDiv.style.opacity = '1'; });
  header.addEventListener('mouseleave', () => { actionsDiv.style.opacity = '0'; });

  const addSubBtn = document.createElement('button');
  addSubBtn.title = 'Aggiungi sottocartella';
  addSubBtn.innerHTML = LucideIcons.get('plus', 12);
  Object.assign(addSubBtn.style, {
    background: 'transparent', border: 'none', color: theme.textSecondary,
    cursor: 'pointer', padding: '3px 5px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', transition: 'all 0.15s ease'
  });
  addSubBtn.addEventListener('mouseenter', () => { addSubBtn.style.background = theme.surfaceHover; addSubBtn.style.color = effectiveColor; });
  addSubBtn.addEventListener('mouseleave', () => { addSubBtn.style.background = 'transparent'; addSubBtn.style.color = theme.textSecondary; });
  addSubBtn.addEventListener('click', (e) => { e.stopPropagation(); addSubfolderFromSidebar(folder.id); });

  const deleteBtn = document.createElement('button');
  deleteBtn.title = 'Elimina cartella';
  deleteBtn.innerHTML = LucideIcons.get('trash2', 12);
  Object.assign(deleteBtn.style, {
    background: 'transparent', border: 'none', color: theme.textSecondary,
    cursor: 'pointer', padding: '3px 5px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', transition: 'all 0.15s ease'
  });
  deleteBtn.addEventListener('mouseenter', () => { deleteBtn.style.background = 'rgba(239,68,68,0.15)'; deleteBtn.style.color = '#ef4444'; });
  deleteBtn.addEventListener('mouseleave', () => { deleteBtn.style.background = 'transparent'; deleteBtn.style.color = theme.textSecondary; });
  deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteFolderFromSidebar(folder.id); });

  actionsDiv.appendChild(addSubBtn);
  actionsDiv.appendChild(deleteBtn);
  header.appendChild(expandBtn);
  header.appendChild(nameSpan);
  header.appendChild(actionsDiv);
  folderDiv.appendChild(header);

  // Hook up context menu event listener
  header.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showFolderContextMenu(e, folder);
  });

  if (folder.subfolders && folder.subfolders.length > 0) {
    const subfoldersDiv = document.createElement('div');
    subfoldersDiv.className = 'subfolders';
    subfoldersDiv.style.cssText = 'display:none;margin-top:4px;';
    folder.subfolders.forEach(sub => {
      subfoldersDiv.appendChild(createFolderElement(sub, subfoldersDiv, depth + 1));
    });
    folderDiv.appendChild(subfoldersDiv);
  }

  return folderDiv;
}

function addProjectFromSidebar(parentId: number): void {
  const allowed = getFolderColors();
  showFolderDialog('Nuovo Progetto', 'Progetto ', allowed[0], 'Crea', (name, color) => {
    const parent = findFolderById(folders, parentId);
    if (parent) {
      parent.subfolders.push({
        id: ++folderIdCounter,
        name,
        subfolders: [],
        chats: [],
        color,
        icon: '💼' // Default project icon
      });
      saveFolders();
      const container = document.getElementById('infolders-sidebar-content');
      if (container) renderFoldersList(container);
      showToast('Progetto creato con successo', 'success');
    }
  });
}

function getCurrentChatDetails(): { name: string; url: string; platform: string } | null {
  const config = getPlatformConfig();
  if (!config) return null;
  const url = normalizeUrl(window.location.href);
  if (!isChatUrl()) return null;
  
  let name = '';
  const spec = BOOKMARK_HOST_SPECS[window.location.hostname];
  if (spec) {
    const anchors = collectBookmarkAnchors(spec.anchorSelectors);
    const currentPath = window.location.pathname;
    const activeAnchor = anchors.find(a => {
      try {
        const aUrl = new URL(a.href);
        return aUrl.pathname === currentPath;
      } catch {
        return false;
      }
    });
    if (activeAnchor) {
      name = activeAnchor.innerText?.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }
  
  if (!name) {
    name = document.title || 'Chat';
  }
  
  return { name, url, platform: config.name };
}

function addChatToFolderFromContextMenu(folder: FolderNode): void {
  showAddChatPickerDialog(folder);
}

function showAddChatPickerDialog(folder: FolderNode): void {
  const theme = currentTheme!;
  const config = getPlatformConfig();
  const platformName = config?.name || 'Chat';
  const accent = theme.appAccent || theme.primary;

  /* ---- collect chats from the page sidebar ---- */
  const spec = BOOKMARK_HOST_SPECS[window.location.hostname];
  const allChats: { name: string; url: string; platform: string }[] = [];
  if (spec) {
    const anchors = collectBookmarkAnchors(spec.anchorSelectors);
    const seenUrls = new Set<string>();
    for (const a of anchors) {
      if (!spec.hrefTest(a.href || '')) continue;
      const url = normalizeUrl(a.href || '');
      if (!url || seenUrls.has(url)) continue;
      seenUrls.add(url);
      allChats.push({ name: a.innerText?.trim() || 'Chat', url, platform: platformName });
    }
  }

  const alreadyAdded = new Set<string>((folder.chats || []).map(c => c.url));
  const availableChats = allChats.filter(c => !alreadyAdded.has(c.url));
  const noChatsFromPage = availableChats.length === 0;

  /* ---- overlay ---- */
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
    zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: '0', transition: 'opacity 0.2s ease'
  });

  /* ---- modal ---- */
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: theme.bg,
    border: `1px solid ${theme.glassBorder}`,
    borderRadius: '18px',
    width: '92%',
    maxWidth: '420px',
    maxHeight: '78vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
    transform: 'translateY(6px)',
    transition: 'transform 0.2s ease'
  });

  /* ---- header ---- */
  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '18px 18px 14px',
    borderBottom: `1px solid ${theme.border}33`,
    flexShrink: '0'
  });

  const headerRow = document.createElement('div');
  Object.assign(headerRow.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' });

  const titleEl = document.createElement('span');
  titleEl.innerHTML = `Add chats to <strong style="color:${accent};">${escapeHtml(folder.name)}</strong> folder`;
  Object.assign(titleEl.style, { fontSize: '14px', fontWeight: '600', color: '#fff' });

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = LucideIcons.get('x', 14);
  Object.assign(closeBtn.style, {
    background: 'transparent', border: 'none', color: theme.textSecondary,
    cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px',
    borderRadius: '6px', transition: 'color 0.15s ease'
  });
  closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = '#fff');
  closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = theme.textSecondary);
  closeBtn.addEventListener('click', () => overlay.remove());

  headerRow.appendChild(titleEl);
  headerRow.appendChild(closeBtn);

  /* ---- search ---- */
  const searchWrap = document.createElement('div');
  Object.assign(searchWrap.style, { position: 'relative' });
  const searchIcon = document.createElement('span');
  searchIcon.innerHTML = LucideIcons.get('search', 13);
  Object.assign(searchIcon.style, {
    position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
    color: theme.textSecondary, pointerEvents: 'none', display: 'flex'
  });
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Filter chats by title...';
  Object.assign(searchInput.style, {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px 9px 34px',
    background: theme.glassBg || 'rgba(255,255,255,0.06)',
    border: `1px solid ${theme.border}44`,
    borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none',
    transition: 'border-color 0.2s ease'
  });
  searchInput.addEventListener('focus', () => searchInput.style.borderColor = accent);
  searchInput.addEventListener('blur', () => searchInput.style.borderColor = `${theme.border}44`);
  searchWrap.appendChild(searchIcon);
  searchWrap.appendChild(searchInput);

  header.appendChild(headerRow);
  header.appendChild(searchWrap);
  modal.appendChild(header);

  /* ---- warning banner if chat list is partial/empty ---- */
  if (noChatsFromPage || allChats.length < 5) {
    const banner = document.createElement('div');
    Object.assign(banner.style, {
      padding: '10px 16px',
      background: 'rgba(245,158,11,0.1)',
      borderBottom: `1px solid rgba(245,158,11,0.2)`,
      display: 'flex', alignItems: 'flex-start', gap: '10px', flexShrink: '0'
    });
    banner.innerHTML = `
      <span style="flex-shrink:0;margin-top:1px;">${LucideIcons.get('triangle-alert', 13)}</span>
      <div>
        <span style="color:#f59e0b;font-size:12px;font-weight:500;">Chat history is only partially imported. Some chats may not be shown.</span>
        <br>
        <span id="infolders-import-all-link" style="color:${accent};font-size:12px;cursor:pointer;text-decoration:underline;margin-top:2px;display:inline-block;">Import all chats</span>
      </div>
    `;
    banner.querySelector('#infolders-import-all-link')!.addEventListener('click', () => {
      showToast('Scorri la sidebar del chatbot per caricare più chat, poi riapri questo dialog.', 'info');
    });
    modal.appendChild(banner);
  }

  /* ---- chat list ---- */
  const listContainer = document.createElement('div');
  Object.assign(listContainer.style, {
    overflowY: 'auto', flex: '1', padding: '8px 0'
  });

  /* scrollbar style via injected rule */
  const scrollStyle = document.createElement('style');
  scrollStyle.textContent = `
    #infolders-chat-picker-list::-webkit-scrollbar { width: 4px; }
    #infolders-chat-picker-list::-webkit-scrollbar-track { background: transparent; }
    #infolders-chat-picker-list::-webkit-scrollbar-thumb { background: ${accent}55; border-radius: 4px; }
    .infolders-chat-row-picker { display:flex; align-items:flex-start; gap:10px; padding:10px 16px; cursor:pointer; transition:background 0.15s ease; }
    .infolders-chat-row-picker:hover { background:rgba(255,255,255,0.04); }
    .infolders-chat-row-picker.selected { background:${accent}18; }
    .infolders-chat-checkbox { width:16px; height:16px; border-radius:5px; border:2px solid ${theme.border}; background:transparent; flex-shrink:0; margin-top:2px; transition:all 0.15s ease; display:flex; align-items:center; justify-content:center; }
    .infolders-chat-row-picker.selected .infolders-chat-checkbox { background:${accent}; border-color:${accent}; }
  `;
  document.head.appendChild(scrollStyle);

  listContainer.id = 'infolders-chat-picker-list';
  modal.appendChild(listContainer);

  /* keep track of selected state */
  const selectedUrls = new Set<string>();
  // Pre-select current page chat if available
  const currentChat = getCurrentChatDetails();
  if (currentChat && !alreadyAdded.has(currentChat.url)) {
    selectedUrls.add(currentChat.url);
  }

  function buildChatRow(chat: { name: string; url: string; platform: string }): HTMLElement {
    const row = document.createElement('div');
    row.className = 'infolders-chat-row-picker' + (selectedUrls.has(chat.url) ? ' selected' : '');

    const checkbox = document.createElement('div');
    checkbox.className = 'infolders-chat-checkbox';
    if (selectedUrls.has(chat.url)) {
      checkbox.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    }

    const info = document.createElement('div');
    Object.assign(info.style, { flex: '1', minWidth: '0' });

    const name = document.createElement('div');
    name.textContent = chat.name;
    Object.assign(name.style, {
      fontSize: '13px', fontWeight: '500', color: '#fff',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    });

    const meta = document.createElement('div');
    meta.textContent = chat.platform;
    Object.assign(meta.style, { fontSize: '11px', color: theme.textSecondary, marginTop: '2px' });

    info.appendChild(name);
    info.appendChild(meta);
    row.appendChild(checkbox);
    row.appendChild(info);

    row.addEventListener('click', () => {
      if (selectedUrls.has(chat.url)) {
        selectedUrls.delete(chat.url);
        row.classList.remove('selected');
        checkbox.innerHTML = '';
      } else {
        selectedUrls.add(chat.url);
        row.classList.add('selected');
        checkbox.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      }
      updateFooter();
    });

    return row;
  }

  /* initial render */
  function renderList(query: string): void {
    listContainer.innerHTML = '';
    const q = query.trim().toLowerCase();
    const chats = q ? availableChats.filter(c => c.name.toLowerCase().includes(q)) : availableChats;

    if (chats.length === 0) {
      listContainer.innerHTML = `<div style="text-align:center;padding:28px 12px;color:${theme.textSecondary};font-size:13px;">
        ${q ? 'No chats found matching your search.' : 'No chats available to add.'}
      </div>`;
      return;
    }
    chats.forEach(c => listContainer.appendChild(buildChatRow(c)));
  }
  renderList('');

  searchInput.addEventListener('input', () => renderList(searchInput.value));

  /* ---- footer ---- */
  const footer = document.createElement('div');
  Object.assign(footer.style, {
    padding: '12px 16px',
    borderTop: `1px solid ${theme.border}33`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: '0'
  });

  const countLabel = document.createElement('span');
  Object.assign(countLabel.style, { fontSize: '12px', color: theme.textSecondary });

  const footerBtns = document.createElement('div');
  Object.assign(footerBtns.style, { display: 'flex', gap: '8px' });

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  Object.assign(clearBtn.style, {
    background: 'transparent', border: `1px solid ${theme.border}55`,
    color: theme.textSecondary, padding: '8px 16px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s ease'
  });
  clearBtn.addEventListener('mouseenter', () => { clearBtn.style.borderColor = theme.border; clearBtn.style.color = '#fff'; });
  clearBtn.addEventListener('mouseleave', () => { clearBtn.style.borderColor = `${theme.border}55`; clearBtn.style.color = theme.textSecondary; });
  clearBtn.addEventListener('click', () => {
    selectedUrls.clear();
    renderList(searchInput.value);
    updateFooter();
  });

  const addBtn = document.createElement('button');
  Object.assign(addBtn.style, {
    background: accent, border: 'none', color: 'white',
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', transition: 'opacity 0.15s ease'
  });

  function updateFooter(): void {
    const n = selectedUrls.size;
    countLabel.textContent = n === 0 ? '' : `${n} chat${n !== 1 ? 's' : ''} selected`;
    addBtn.textContent = n === 0 ? 'Add' : `Add ${n}`;
    addBtn.style.opacity = n === 0 ? '0.5' : '1';
    clearBtn.style.display = n === 0 ? 'none' : 'inline-flex';
  }
  updateFooter();

  addBtn.addEventListener('click', () => {
    if (selectedUrls.size === 0) return;
    chrome.storage.local.get(['infolders_premium'], (r: Record<string, any>) => {
      const existing = (folder.chats || []).length;
      if (!canAddAnotherChat(r.infolders_premium, folders, selectedUrls.size)) {
        showToast(`Limite ${FREE_CHAT_LIMIT} chat raggiunto. Attiva Pro.`, 'warning');
        return;
      }
      folder.chats = folder.chats || [];
      const toAdd = availableChats.filter(c => selectedUrls.has(c.url));
      for (const c of toAdd) {
        if (!folder.chats.some(existing => existing.url === c.url)) {
          folder.chats.push({ name: c.name, url: c.url, platform: c.platform });
        }
      }
      saveFolders();
      const container = document.getElementById('infolders-sidebar-content');
      if (container) renderFoldersList(container);
      showToast(`${toAdd.length} chat aggiunt${toAdd.length !== 1 ? 'e' : 'a'} correttamente!`, 'success');
      overlay.remove();
      scrollStyle.remove();
    });
  });

  footerBtns.appendChild(clearBtn);
  footerBtns.appendChild(addBtn);
  footer.appendChild(countLabel);
  footer.appendChild(footerBtns);
  modal.appendChild(footer);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); scrollStyle.remove(); } });
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    modal.style.transform = 'translateY(0)';
    searchInput.focus();
  });
}

function getValidMoveTargets(nodes: FolderNode[], excludeId: number, prefix = ''): { id: number; name: string }[] {
  let out: { id: number; name: string }[] = [];
  for (const n of nodes) {
    if (n.id === excludeId) continue;
    out.push({ id: n.id, name: prefix + n.name });
    if (n.subfolders) {
      out = out.concat(getValidMoveTargets(n.subfolders, excludeId, prefix + n.name + ' / '));
    }
  }
  return out;
}

function findAndRemoveFolder(nodes: FolderNode[], id: number): FolderNode | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return nodes.splice(i, 1)[0];
    }
    if (nodes[i].subfolders) {
      const found = findAndRemoveFolder(nodes[i].subfolders, id);
      if (found) return found;
    }
  }
  return null;
}

function showMoveFolderDialog(folder: FolderNode): void {
  const theme = currentTheme!;
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
    zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center'
  });
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: theme.bg, border: `1px solid ${theme.glassBorder}`, borderRadius: '16px',
    padding: '24px', width: '90%', maxWidth: '400px', color: 'white'
  });

  const validTargets = getValidMoveTargets(folders, folder.id);
  const optionsHtml = validTargets.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');

  modal.innerHTML = `
    <h3 style="margin:0 0 16px;font-size:16px;">Sposta Cartella</h3>
    <p style="margin:0 0 12px;font-size:13px;color:${theme.textSecondary};">Seleziona la destinazione per <strong>${escapeHtml(folder.name)}</strong>:</p>
    <div style="margin-bottom:20px;">
      <select id="move-target-select" style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:13px;outline:none;">
        <option value="root">Cartella principale (Root)</option>
        ${optionsHtml}
      </select>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="move-cancel" style="background:transparent;border:1px solid ${theme.border};color:${theme.textSecondary};padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">Annulla</button>
      <button id="move-save" style="background:${theme.primary};border:none;color:white;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Sposta</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal.querySelector('#move-cancel')!.addEventListener('click', () => overlay.remove());
  modal.querySelector('#move-save')!.addEventListener('click', () => {
    const target = modal.querySelector<HTMLSelectElement>('#move-target-select')!.value;
    const nodeToMove = findAndRemoveFolder(folders, folder.id);
    if (!nodeToMove) {
      showToast('Errore nello spostamento della cartella', 'error');
      overlay.remove();
      return;
    }

    if (target === 'root') {
      folders.push(nodeToMove);
    } else {
      const destParent = findFolderById(folders, Number(target));
      if (destParent) {
        destParent.subfolders = destParent.subfolders || [];
        destParent.subfolders.push(nodeToMove);
      } else {
        folders.push(nodeToMove);
      }
    }
    
    saveFolders();
    const container = document.getElementById('infolders-sidebar-content');
    if (container) renderFoldersList(container);
    showToast('Cartella spostata con successo', 'success');
    overlay.remove();
  });
}

function showEditLogoDialog(folder: FolderNode): void {
  const theme = currentTheme!;
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
    zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center'
  });
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: theme.bg, border: `1px solid ${theme.glassBorder}`, borderRadius: '16px',
    padding: '24px', width: '90%', maxWidth: '400px', color: 'white'
  });

  const presets = ['📁', '💼', '🎓', '💻', '🤖', '📝', '🌟', '🔥', '💡', '📊', '❤️', '✈️'];
  const presetsHtml = presets.map(p =>
    `<button class="logo-preset-btn" data-value="${p}" style="background:rgba(255,255,255,0.05);border:1px solid ${theme.border};color:white;width:36px;height:36px;border-radius:8px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;">${p}</button>`
  ).join('');

  modal.innerHTML = `
    <h3 style="margin:0 0 12px;font-size:16px;">Modifica Logo</h3>
    <p style="margin:0 0 12px;font-size:12px;color:${theme.textSecondary};">Seleziona un'icona predefinita o inserisci un'emoji a scelta:</p>
    <div style="display:grid;grid-template-columns:repeat(6, 1fr);gap:8px;margin-bottom:16px;">
      ${presetsHtml}
    </div>
    <div style="margin-bottom:16px;">
      <label style="font-size:11px;color:${theme.textSecondary};">Emoji o Nome Icona Lucide (es: star, help-circle)</label>
      <input id="custom-logo-input" value="${escapeHtml(folder.icon || '')}" placeholder="es: 🚀" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:13px;outline:none;">
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="logo-reset" style="background:transparent;border:1px solid ${theme.border};color:${theme.textSecondary};padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;margin-right:auto;">Ripristina default</button>
      <button id="logo-cancel" style="background:transparent;border:1px solid ${theme.border};color:${theme.textSecondary};padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">Annulla</button>
      <button id="logo-save" style="background:${theme.primary};border:none;color:white;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Salva</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const customInput = modal.querySelector<HTMLInputElement>('#custom-logo-input')!;

  modal.querySelectorAll('.logo-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      customInput.value = (btn as HTMLElement).dataset.value!;
      customInput.focus();
    });
  });

  modal.querySelector('#logo-reset')!.addEventListener('click', () => {
    folder.icon = undefined;
    saveFolders();
    const container = document.getElementById('infolders-sidebar-content');
    if (container) renderFoldersList(container);
    overlay.remove();
  });

  modal.querySelector('#logo-cancel')!.addEventListener('click', () => overlay.remove());
  modal.querySelector('#logo-save')!.addEventListener('click', () => {
    const val = customInput.value.trim();
    if (val) {
      folder.icon = val;
    } else {
      folder.icon = undefined;
    }
    saveFolders();
    const container = document.getElementById('infolders-sidebar-content');
    if (container) renderFoldersList(container);
    overlay.remove();
  });
}

function showChangeColorDialog(folder: FolderNode): void {
  const theme = currentTheme!;
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
    zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center'
  });
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: theme.bg, border: `1px solid ${theme.glassBorder}`, borderRadius: '16px',
    padding: '24px', width: '90%', maxWidth: '400px', color: 'white'
  });

  const availableColors = getFolderColors();
  let selectedColor = sanitizeColor(folder.color);
  const colorSwatches = availableColors.map(c =>
    `<button class="change-color-swatch" data-color="${c}" style="width:32px;height:32px;border-radius:8px;background:${c};border:${c === selectedColor ? '3px solid white' : '2px solid transparent'};cursor:pointer;transition:all 0.15s ease;"></button>`
  ).join('');

  modal.innerHTML = `
    <h3 style="margin:0 0 16px;font-size:16px;">Cambia Colore</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;justify-content:center;">${colorSwatches}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="color-cancel" style="background:transparent;border:1px solid ${theme.border};color:${theme.textSecondary};padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">Annulla</button>
      <button id="color-save" style="background:${theme.primary};border:none;color:white;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Salva</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.querySelectorAll('.change-color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = (btn as HTMLElement).dataset.color!;
      overlay.querySelectorAll('.change-color-swatch').forEach(b => {
        (b as HTMLElement).style.border = (b as HTMLElement).dataset.color === selectedColor ? '3px solid white' : '2px solid transparent';
      });
    });
  });

  modal.querySelector('#color-cancel')!.addEventListener('click', () => overlay.remove());
  modal.querySelector('#color-save')!.addEventListener('click', () => {
    folder.color = selectedColor;
    saveFolders();
    const container = document.getElementById('infolders-sidebar-content');
    if (container) renderFoldersList(container);
    overlay.remove();
  });
}

function showFolderContextMenu(e: MouseEvent, folder: FolderNode): void {
  const existing = document.getElementById('infolders-context-menu');
  if (existing) existing.remove();

  const theme = currentTheme || {
    bg: '#18181b',
    glassBg: '#09090b',
    glassBorder: 'rgba(255,255,255,0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    border: 'rgba(255,255,255,0.1)',
    appAccent: '#a855f7',
    surfaceHover: 'rgba(255,255,255,0.08)',
    primary: '#a855f7'
  };

  const menu = document.createElement('div');
  menu.id = 'infolders-context-menu';
  Object.assign(menu.style, {
    position: 'fixed',
    zIndex: '2147483647',
    background: theme.glassBg || 'rgba(15, 15, 15, 0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${theme.glassBorder || 'rgba(255, 255, 255, 0.15)'}`,
    borderRadius: '12px',
    boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${theme.appAccent || '#a855f7'}15`,
    padding: '6px',
    minWidth: '180px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    color: theme.textPrimary || '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    pointerEvents: 'auto',
    userSelect: 'none'
  });

  const createMenuItem = (icon: string, label: string, onClick: () => void, hasInfo = false) => {
    const item = document.createElement('div');
    Object.assign(item.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      color: theme.textPrimary || '#ffffff'
    });

    const iconSpan = document.createElement('span');
    iconSpan.style.display = 'flex';
    iconSpan.style.alignItems = 'center';
    iconSpan.style.color = theme.textSecondary || '#a1a1aa';
    iconSpan.innerHTML = LucideIcons.get(icon, 14);

    const textSpan = document.createElement('span');
    textSpan.textContent = label;
    textSpan.style.flex = '1';

    item.appendChild(iconSpan);
    item.appendChild(textSpan);

    if (hasInfo) {
      const infoSpan = document.createElement('span');
      Object.assign(infoSpan.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        background: `${theme.appAccent || '#a855f7'}22`,
        color: theme.appAccent || '#a855f7',
        fontSize: '9px',
        fontWeight: 'bold',
        marginLeft: '6px'
      });
      infoSpan.textContent = 'i';
      infoSpan.title = 'I progetti ti permettono di raggruppare chat e impostazioni per argomento.';
      item.appendChild(infoSpan);
    }

    if (label === t('menu.delete') || label === 'Delete' || label === 'Elimina') {
      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(239, 68, 68, 0.15)';
        item.style.color = '#ef4444';
        iconSpan.style.color = '#ef4444';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent';
        item.style.color = theme.textPrimary || '#ffffff';
        iconSpan.style.color = theme.textSecondary || '#a1a1aa';
      });
    } else {
      item.addEventListener('mouseenter', () => {
        item.style.background = theme.surfaceHover || 'rgba(255, 255, 255, 0.08)';
        iconSpan.style.color = theme.appAccent || '#a855f7';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent';
        iconSpan.style.color = theme.textSecondary || '#a1a1aa';
      });
    }

    item.addEventListener('click', (ev) => {
      ev.stopPropagation();
      menu.remove();
      onClick();
    });

    return item;
  };

  menu.appendChild(createMenuItem('folder-plus', t('menu.add.folder'), () => addSubfolderFromSidebar(folder.id)));
  menu.appendChild(createMenuItem('folder-cog', t('menu.add.project'), () => addProjectFromSidebar(folder.id), true));
  menu.appendChild(createMenuItem('message-square-plus', t('menu.add.chats'), () => addChatToFolderFromContextMenu(folder)));
  menu.appendChild(createMenuItem('folder-symlink', t('menu.move.to'), () => showMoveFolderDialog(folder)));
  menu.appendChild(createMenuItem('scan', t('menu.edit.logo'), () => showEditLogoDialog(folder)));
  menu.appendChild(createMenuItem('edit3', t('menu.rename'), () => {
    showFolderDialog('Rinomina cartella', folder.name, sanitizeColor(folder.color), 'Salva', (name, color) => {
      folder.name = name;
      folder.color = color;
      saveFolders();
      const c = document.getElementById('infolders-sidebar-content');
      if (c) renderFoldersList(c);
    });
  }));
  menu.appendChild(createMenuItem('palette', t('menu.change.color'), () => showChangeColorDialog(folder)));
  menu.appendChild(createMenuItem('trash2', t('menu.delete'), () => deleteFolderFromSidebar(folder.id)));

  document.body.appendChild(menu);

  const menuWidth = menu.offsetWidth || 180;
  const menuHeight = menu.offsetHeight || 290;
  let left = e.clientX;
  let top = e.clientY;

  if (left + menuWidth > window.innerWidth) {
    left = window.innerWidth - menuWidth - 10;
  }
  if (top + menuHeight > window.innerHeight) {
    top = window.innerHeight - menuHeight - 10;
  }
  if (left < 0) left = 10;
  if (top < 0) top = 10;

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;

  const closeMenu = (event: MouseEvent) => {
    if (!menu.contains(event.target as Node)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('contextmenu', closeMenu);
    }
  };

  setTimeout(() => {
    document.addEventListener('click', closeMenu);
    document.addEventListener('contextmenu', closeMenu);
  }, 100);
}

function renderBookmarksTab(container: HTMLElement): void {
  const theme = currentTheme!;
  container.innerHTML = `
    <div style="padding:0 0 8px;">
      <p style="color:${theme.textSecondary};font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:0 0 14px;">Bookmarks</p>
      <div id="bookmarks-list"></div>
    </div>
  `;
  renderBookmarksList(container);
}

function renderBookmarksList(container: HTMLElement): void {
  const theme = currentTheme!;
  const list = container.querySelector<HTMLElement>('#bookmarks-list');
  if (!list) return; list.innerHTML = '';
  if (bookmarks.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:40px 16px;">
        <span style="color:${theme.appAccent};display:flex;justify-content:center;margin-bottom:12px;opacity:0.5;">${LucideIcons.get('bookmark', 28)}</span>
        <p style="color:${theme.textSecondary};font-size:12px;line-height:1.6;margin:0;">Nessun bookmark ancora.</p>
      </div>`;
    return;
  }

  bookmarks.forEach((bookmark, idx) => {
    const item = document.createElement('div');
    Object.assign(item.style, {
      padding: '12px 14px', marginBottom: '8px',
      background: theme.surface, border: `1px solid ${theme.border}`,
      borderLeft: `3px solid ${theme.appAccent}`, borderRadius: '12px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      transition: 'all 0.18s ease', cursor: 'default'
    });
    item.addEventListener('mouseenter', () => { item.style.background = theme.surfaceHover; item.style.borderColor = `${theme.appAccent}44`; item.style.borderLeftColor = theme.appAccent; });
    item.addEventListener('mouseleave', () => { item.style.background = theme.surface; item.style.borderColor = theme.border; item.style.borderLeftColor = theme.appAccent; });

    const title = document.createElement('div');
    title.textContent = bookmark.name;
    Object.assign(title.style, {
      fontWeight: '600', fontSize: '13px', cursor: 'pointer',
      color: theme.textPrimary, lineHeight: '1.4',
      display: '-webkit-box', WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical', overflow: 'hidden'
    } as any);
    title.addEventListener('click', () => openChat(bookmark.url));

    const meta = document.createElement('div');
    Object.assign(meta.style, {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', fontSize: '11px', color: theme.textSecondary
    });
    meta.innerHTML = `
      <span style="display:flex;align-items:center;gap:4px;">
        <span style="color:${theme.appAccent};opacity:0.7;">${LucideIcons.get('message-circle', 10)}</span>
        ${escapeHtml(bookmark.platform || 'Generico')}
      </span>
      <button class="remove-bookmark" data-idx="${idx}" style="background:none;border:none;color:${theme.textSecondary};cursor:pointer;display:flex;align-items:center;padding:4px 5px;border-radius:6px;transition:all 0.15s ease;">${LucideIcons.get('x', 13)}</button>
    `;

    item.appendChild(title);
    item.appendChild(meta);
    list.appendChild(item);

    item.querySelector('.remove-bookmark')!.addEventListener('click', (e) => {
      e.stopPropagation();
      removeBookmark(idx);
    });
  });
}

function exportData(): void {
  if (!currentUser) return;
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userId: currentUser.id,
    folders: folders,
    folderIdCounter: folderIdCounter,
    bookmarks: bookmarks
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
          showToast('Questo backup appartiene a un altro utente', 'warning');
          return;
        }
        folders = data.folders || [];
        folderIdCounter = data.folderIdCounter || 0;
        bookmarks = data.bookmarks || [];
        saveFolders();
        saveBookmarks();
        const container = document.getElementById('infolders-sidebar-content');
        if (container) {
          renderFoldersList(container);
          renderBookmarksList(container);
        }
        showToast('Backup importato con successo', 'success');
      } catch (err) {
        showToast('File backup non valido', 'warning');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearAllData(): void {
  if (!confirm('Sei sicuro di voler cancellare tutti i dati? Questa azione è irreversibile.')) return;
  folders = [];
  folderIdCounter = 0;
  bookmarks = [];
  saveFolders();
  saveBookmarks();
  const container = document.getElementById('infolders-sidebar-content');
  if (container) {
    renderFoldersList(container);
    renderBookmarksList(container);
  }
  showToast('Dati cancellati con successo', 'success');
}

function showFolderDialog(title: string, initialName: string, initialColor: string, confirmLabel: string, onConfirm: (name: string, color: string) => void): void {
  const theme = currentTheme!;
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
    zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center'
  });
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: theme.bg, border: `1px solid ${theme.glassBorder}`, borderRadius: '16px',
    padding: '24px', width: '90%', maxWidth: '400px', color: 'white'
  });

  const availableColors = getFolderColors();
  let selectedColor = availableColors.includes(initialColor) ? initialColor : availableColors[0];
  const colorSwatches = availableColors.map(c =>
    `<button class="folder-color-swatch" data-color="${c}" style="width:28px;height:28px;border-radius:8px;background:${c};border:${c === selectedColor ? '3px solid white' : '2px solid transparent'};cursor:pointer;transition:all 0.15s ease;"></button>`
  ).join('');

  modal.innerHTML = `
    <h3 style="margin:0 0 16px;font-size:16px;">${title}</h3>
    <input id="folder-name-input" placeholder="Nome cartella" value="${initialName}" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:13px;margin-bottom:16px;outline:none;" autofocus>
    <p style="margin:0 0 8px;font-size:12px;color:${theme.textSecondary};">Colore</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">${colorSwatches}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="folder-cancel" style="background:transparent;border:1px solid ${theme.border};color:${theme.textSecondary};padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">Annulla</button>
      <button id="folder-save" style="background:${theme.primary};border:none;color:white;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">${confirmLabel}</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.querySelectorAll('.folder-color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = (btn as HTMLElement).dataset.color!;
      overlay.querySelectorAll('.folder-color-swatch').forEach(b => {
        (b as HTMLElement).style.border = (b as HTMLElement).dataset.color === selectedColor ? '3px solid white' : '2px solid transparent';
      });
    });
  });

  modal.querySelector('#folder-cancel')!.addEventListener('click', () => overlay.remove());
  modal.querySelector('#folder-save')!.addEventListener('click', () => {
    const name = (modal.querySelector<HTMLInputElement>('#folder-name-input')!).value.trim();
    if (!name) { showToast('Inserisci un nome per la cartella', 'warning'); return; }
    overlay.remove();
    onConfirm(name, selectedColor);
  });
  requestAnimationFrame(() => modal.querySelector<HTMLInputElement>('#folder-name-input')!.focus());
}

function addRootFolderFromSidebar(): void {
  const allowed = getFolderColors();
  showFolderDialog('Nuova cartella', '', allowed[0], 'Crea', (name, color) => {
    folders.push({ id: ++folderIdCounter, name, subfolders: [], chats: [], color });
    saveFolders();
    const container = document.getElementById('infolders-sidebar-content');
    if (container) renderFoldersList(container);
  });
}

function addSubfolderFromSidebar(parentId: number): void {
  const allowed = getFolderColors();
  showFolderDialog('Nuova sottocartella', '', allowed[0], 'Crea', (name, color) => {
    const parent = findFolderById(folders, parentId);
    if (parent) {
      parent.subfolders.push({ id: ++folderIdCounter, name, subfolders: [], chats: [], color });
      saveFolders();
      const container = document.getElementById('infolders-sidebar-content');
      if (container) renderFoldersList(container);
    }
  });
}

function deleteFolderFromSidebar(id: number): void {
  if (confirm('Eliminare questa cartella?')) {
    folders = removeFolderById(folders, id);
    saveFolders();
    const container = document.getElementById('infolders-sidebar-content');
    if (container) renderFoldersList(container);
  }
}

function findFolderById(arr: FolderNode[], id: number): FolderNode | null {
  for (const f of arr) {
    if (f.id === id) return f;
    if (f.subfolders) {
      const found = findFolderById(f.subfolders, id);
      if (found) return found;
    }
  }
  return null;
}

function removeFolderById(arr: FolderNode[], id: number): FolderNode[] {
  return arr.filter(f => {
    if (f.id === id) return false;
    if (f.subfolders) f.subfolders = removeFolderById(f.subfolders, id);
    return true;
  });
}

function loadUserAndBookmarks(): void {
  chrome.storage.local.get(['currentUser', 'infolders_bookmarks', 'infolders_premium'], (result: Record<string, any>) => {
    currentUser = result.currentUser || null;
    if (currentUser && (currentUser as any).accessToken) {
      const { accessToken: _t, ...rest } = currentUser as any;
      currentUser = rest as UserProfile;
      chrome.storage.local.set({ currentUser });
    }
    bookmarks = result.infolders_bookmarks || [];
    infoldersPremium = result.infolders_premium || null;
    if (isSidebarOpen) switchTab('account');
    else if (!currentUser) scheduleAutoOpenSidebarForGuest();
  });
}

async function syncPremiumStatusFromSupabase(): Promise<void> {
  if (!currentUser) return;
  try {
    const data = await syncUserData(currentUser.id);
    if (data && data.premiumData) {
      infoldersPremium = data.premiumData;
      chrome.storage.local.set({ infolders_premium: data.premiumData });
    }
  } catch {
    // Silenzioso — il sync non è bloccante
  }
}

function saveBookmarks(): void {
  if (!currentUser) return;
  chrome.storage.local.set({ infolders_bookmarks: bookmarks });
  syncToSupabase();
}

function addBookmark(name: string, url: string, platform: string): void {
  if (!currentUser) {
    openSidebar();
    setTimeout(() => switchTab('account'), 400);
    return;
  }
  bookmarks.unshift({ id: Date.now(), name, url, platform, addedAt: new Date().toISOString() });
  saveBookmarks();
  openSidebar();
  setTimeout(() => switchTab('bookmarks'), 300);
}

function removeBookmark(idx: number): void {
  bookmarks.splice(idx, 1);
  saveBookmarks();
  const container = document.getElementById('infolders-sidebar-content');
  if (container) renderBookmarksList(container);
}

function openChat(url: string): void {
  chrome.tabs.create({ url });
}

function loadFoldersFromBackground(): void {
  chrome.runtime.sendMessage({ action: 'getFolders' }, (response) => {
    if (response && response.folders) {
      folders = response.folders || [];
      folderIdCounter = response.counter || 0;
      buildFolderUrlMap();
      injectInPageFoldersSection();
      refreshAllFolderViews();
    }
  });
}

function saveFolders(): void {
  if (!currentUser) return;
  chrome.runtime.sendMessage({
    action: 'saveFolders',
    userId: currentUser.id,
    folders: folders,
    counter: folderIdCounter
  });
  syncToSupabase();
  buildFolderUrlMap();
  refreshAllFolderViews();
}

function renderPromptsTab(container: HTMLElement): void {
  const theme = currentTheme!;
  const prompts = loadPrompts();
  const categories = [...new Set(prompts.map(p => p.category))];

  container.innerHTML = `
    <div style="padding:0 0 8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <p style="color:${theme.textSecondary};font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:0;">Libreria Prompt</p>
        <button id="add-prompt-btn" style="background:${theme.appAccent};border:none;color:white;padding:6px 14px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;letter-spacing:0.2px;transition:all 0.2s ease;box-shadow:0 2px 10px ${theme.appAccent}33;">${LucideIcons.get('plus', 12)} Nuovo</button>
      </div>
      <div style="position:relative;margin-bottom:12px;">
        <span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:${theme.textSecondary};pointer-events:none;display:flex;">${LucideIcons.get('search', 13)}</span>
        <input type="search" id="prompt-search" placeholder="Cerca prompt..." style="width:100%;box-sizing:border-box;padding:9px 12px 9px 33px;border-radius:10px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:12px;outline:none;transition:border-color 0.2s ease;">
      </div>
      ${categories.length > 0 ? `<div id="prompt-categories" style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;"></div>` : ''}
      <div id="prompts-list"></div>
    </div>
  `;

  const catContainer = container.querySelector<HTMLElement>('#prompt-categories');
  if (catContainer) {
    const allBtn = document.createElement('button');
    Object.assign(allBtn.style, { padding: '4px 12px', borderRadius: '20px', border: `1px solid ${theme.appAccent}55`, background: `${theme.appAccent}18`, color: theme.appAccent, cursor: 'pointer', fontSize: '11px', fontWeight: '600', transition: 'all 0.15s ease' });
    allBtn.textContent = 'Tutte';
    allBtn.dataset.cat = '';
    allBtn.addEventListener('click', () => renderPromptList(container, ''));
    catContainer.appendChild(allBtn);
    categories.forEach(cat => {
      const btn = document.createElement('button');
      Object.assign(btn.style, { padding: '4px 12px', borderRadius: '20px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, cursor: 'pointer', fontSize: '11px', fontWeight: '500', transition: 'all 0.15s ease' });
      btn.textContent = cat;
      btn.dataset.cat = cat;
      btn.addEventListener('click', () => renderPromptList(container, cat));
      catContainer.appendChild(btn);
    });
  }

  renderPromptList(container, '');

  container.querySelector('#add-prompt-btn')!.addEventListener('click', () => showPromptEditor(container));
  const searchEl = container.querySelector<HTMLInputElement>('#prompt-search')!;
  searchEl.addEventListener('input', () => renderPromptList(container, ''));
  searchEl.addEventListener('focus', function (this: HTMLInputElement) { this.style.borderColor = theme.appAccent; });
  searchEl.addEventListener('blur', function (this: HTMLInputElement) { this.style.borderColor = theme.border; });
}

function renderPromptList(container: HTMLElement, category: string): void {
  const theme = currentTheme!;
  const list = container.querySelector<HTMLElement>('#prompts-list');
  if (!list) return;
  const q = (container.querySelector<HTMLInputElement>('#prompt-search')?.value || '').trim();
  const prompts = filterPrompts(q, category || undefined);
  list.innerHTML = '';
  if (prompts.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px 16px;"><span style="color:${theme.appAccent};display:flex;justify-content:center;margin-bottom:12px;opacity:0.5;">${LucideIcons.get('file-text', 28)}</span><p style="color:${theme.textSecondary};font-size:12px;line-height:1.6;margin:0;">${q ? `Nessun prompt per "${escapeHtml(q)}"` : 'Nessun prompt. Clicca <strong>Nuovo</strong> per aggiungerne uno.'}</p></div>`;
    return;
  }
  prompts.forEach(p => {
    const card = document.createElement('div');
    Object.assign(card.style, { padding: '13px 14px', marginBottom: '8px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', transition: 'all 0.18s ease' });
    card.addEventListener('mouseenter', () => { card.style.background = theme.surfaceHover; card.style.borderColor = `${theme.appAccent}33`; });
    card.addEventListener('mouseleave', () => { card.style.background = theme.surface; card.style.borderColor = theme.border; });
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;margin-bottom:6px;">
        <strong style="color:${theme.textPrimary};font-size:13px;font-weight:600;line-height:1.3;">${escapeHtml(p.title)}</strong>
        <span style="color:${theme.appAccent};font-size:10px;font-weight:600;background:${theme.appAccent}18;padding:2px 8px;border-radius:20px;flex-shrink:0;border:1px solid ${theme.appAccent}33;">${escapeHtml(p.category)}</span>
      </div>
      <p style="color:${theme.textSecondary};font-size:11px;margin:0 0 10px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(p.content.substring(0, 140))}</p>
      <div style="display:flex;gap:6px;">
        <button class="prompt-copy" data-id="${p.id}" style="flex:1;background:${theme.appAccent};border:none;color:white;padding:7px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.15s ease;">${LucideIcons.get('clipboard', 12)} Copia</button>
        <button class="prompt-delete" data-id="${p.id}" style="background:transparent;border:1px solid rgba(239,68,68,0.25);color:rgba(239,68,68,0.7);padding:7px 9px;border-radius:8px;cursor:pointer;display:flex;align-items:center;transition:all 0.15s ease;">${LucideIcons.get('trash2', 12)}</button>
      </div>
    `;
    card.querySelector('.prompt-copy')!.addEventListener('click', () => {
      copyToClipboard(p.content);
      showToast('Prompt copiato negli appunti!', 'success');
    });
    card.querySelector('.prompt-delete')!.addEventListener('click', () => {
      deletePrompt(p.id);
      renderPromptList(container, category);
    });
    list.appendChild(card);
  });
}

function showPromptEditor(container: HTMLElement): void {
  const theme = currentTheme!;
  const overlay = document.createElement('div');
  Object.assign(overlay.style, { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const modal = document.createElement('div');
  Object.assign(modal.style, { background: theme.bg, border: `1px solid ${theme.glassBorder}`, borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '420px', color: 'white' });
  modal.innerHTML = `
    <h3 style="margin:0 0 16px;font-size:16px;">Nuovo Prompt</h3>
    <input id="prompt-title" placeholder="Titolo" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:13px;margin-bottom:10px;outline:none;">
    <input id="prompt-category" placeholder="Categoria (es. Scrittura, Coding, Marketing)" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:13px;margin-bottom:10px;outline:none;">
    <textarea id="prompt-content" placeholder="Testo del prompt..." rows="6" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:13px;margin-bottom:16px;outline:none;resize:vertical;font-family:inherit;"></textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="prompt-cancel" style="background:transparent;border:1px solid ${theme.border};color:${theme.textSecondary};padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">Annulla</button>
      <button id="prompt-save" style="background:${theme.primary};border:none;color:white;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Salva</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.style.opacity = '1');
  modal.querySelector('#prompt-cancel')!.addEventListener('click', () => overlay.remove());
  modal.querySelector('#prompt-save')!.addEventListener('click', () => {
    const title = (modal.querySelector<HTMLInputElement>('#prompt-title')!).value.trim();
    const content = (modal.querySelector<HTMLTextAreaElement>('#prompt-content')!).value.trim();
    const category = (modal.querySelector<HTMLInputElement>('#prompt-category')!).value.trim() || 'Generale';
    if (!title || !content) { showToast('Inserisci titolo e contenuto', 'warning'); return; }
    addPrompt(title, content, category);
    overlay.remove();
    renderPromptsTab(document.getElementById('infolders-sidebar-content')!);
    showToast('Prompt salvato!', 'success');
  });
}

function renderProfilesTab(container: HTMLElement): void {
  const theme = currentTheme!;
  const profiles = loadProfiles();
  const active = getActiveProfile();

  container.innerHTML = `
    <div style="padding:0 0 8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <p style="color:${theme.textSecondary};font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:0;">Profili Istruzioni</p>
        <button id="add-profile-btn" style="background:${theme.appAccent};border:none;color:white;padding:6px 14px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;letter-spacing:0.2px;transition:all 0.2s ease;box-shadow:0 2px 10px ${theme.appAccent}33;">${LucideIcons.get('plus', 12)} Nuovo</button>
      </div>
      ${active ? `<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:${theme.appAccent}10;border:1px solid ${theme.appAccent}30;border-radius:10px;margin-bottom:12px;"><span style="color:${theme.appAccent};">${LucideIcons.get('check-circle', 14)}</span><span style="color:${theme.textPrimary};font-size:12px;">Profilo attivo: <strong style="color:${theme.appAccent};">${escapeHtml(active.name)}</strong></span></div>` : `<div style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid ${theme.border};border-radius:10px;margin-bottom:12px;"><span style="color:${theme.textSecondary};font-size:11px;">Nessun profilo attivo. Clicca su un profilo per attivarlo.</span></div>`}
      <div id="profiles-list"></div>
    </div>
  `;

  const list = container.querySelector<HTMLElement>('#profiles-list')!;
  if (profiles.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px 16px;"><span style="color:${theme.appAccent};display:flex;justify-content:center;margin-bottom:12px;opacity:0.5;">${LucideIcons.get('user-check', 28)}</span><p style="color:${theme.textSecondary};font-size:12px;line-height:1.6;margin:0;">Nessun profilo ancora.<br>Clicca <strong>Nuovo</strong> per crearne uno.</p></div>`;
  }

  profiles.forEach(p => {
    const card = document.createElement('div');
    const isActive = active?.id === p.id;
    const profileColor = sanitizeColor(p.color);
    const effectiveColor = profileColor === '#000000' ? 'rgba(255,255,255,0.8)' : profileColor;
    const displayBg = isActive ? `${effectiveColor}10` : theme.surface;
    const displayBorder = isActive ? `${effectiveColor}44` : theme.border;

    Object.assign(card.style, { padding: '13px 14px', marginBottom: '8px', background: displayBg, border: `1px solid ${displayBorder}`, borderLeft: `3px solid ${effectiveColor}`, borderRadius: '12px', cursor: 'default', transition: 'all 0.18s ease' });
    card.addEventListener('mouseenter', () => { if (!isActive) { card.style.background = theme.surfaceHover; card.style.borderColor = `${effectiveColor}33`; card.style.borderLeftColor = effectiveColor; } });
    card.addEventListener('mouseleave', () => { if (!isActive) { card.style.background = displayBg; card.style.borderColor = displayBorder; card.style.borderLeftColor = effectiveColor; } });

    const activeBadge = isActive ? `<span style="background:${effectiveColor}22;color:${effectiveColor};border:1px solid ${effectiveColor}44;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.5px;flex-shrink:0;">ATTIVO</span>` : '';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;margin-bottom:10px;">
        <div style="min-width:0;">
          <div style="font-weight:700;color:${effectiveColor};font-size:13px;margin-bottom:3px;">${escapeHtml(p.name)}</div>
          <p style="color:${theme.textSecondary};font-size:11px;margin:0;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(p.description || 'Nessuna descrizione')}</p>
        </div>
        ${activeBadge}
      </div>
      <div style="display:flex;gap:6px;">
        <button class="profile-activate" data-id="${p.id}" style="flex:1;border:none;padding:7px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.15s ease;background:${isActive ? 'rgba(255,255,255,0.06)' : effectiveColor};color:${isActive ? theme.textSecondary : 'white'};border:1px solid ${isActive ? 'rgba(255,255,255,0.1)' : effectiveColor};">${isActive ? `${LucideIcons.get('x', 11)} Disattiva` : `${LucideIcons.get('check', 11)} Attiva`}</button>
        <button class="profile-delete" data-id="${p.id}" style="background:transparent;border:1px solid rgba(239,68,68,0.25);color:rgba(239,68,68,0.7);padding:7px 9px;border-radius:8px;cursor:pointer;display:flex;align-items:center;transition:all 0.15s ease;">${LucideIcons.get('trash2', 12)}</button>
      </div>
    `;
    card.querySelector('.profile-activate')!.addEventListener('click', (e) => {
      e.stopPropagation();
      if (active?.id === p.id) {
        clearActiveProfile();
        showToast(`Profilo "${p.name}" disattivato`, 'info');
      } else {
        setActiveProfile(p);
        showToast(`Profilo "${p.name}" attivato`, 'success');
      }
      renderProfilesTab(container);
    });
    card.querySelector('.profile-delete')!.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteProfile(p.id);
      renderProfilesTab(container);
    });
    list.appendChild(card);
  });

  container.querySelector('#add-profile-btn')!.addEventListener('click', () => showProfileEditor(container));
}

function showProfileEditor(container: HTMLElement): void {
  const theme = currentTheme!;
  const overlay = document.createElement('div');
  Object.assign(overlay.style, { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const modal = document.createElement('div');
  Object.assign(modal.style, { background: theme.bg, border: `1px solid ${theme.glassBorder}`, borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '420px', color: 'white' });
  modal.innerHTML = `
    <h3 style="margin:0 0 16px;font-size:16px;">Nuovo Profilo</h3>
    <input id="profile-name" placeholder="Nome profilo (es. Sviluppatore)" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:13px;margin-bottom:10px;outline:none;">
    <input id="profile-desc" placeholder="Breve descrizione" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:13px;margin-bottom:10px;outline:none;">
    <textarea id="profile-instructions" placeholder="Istruzioni personalizzate per ChatGPT..." rows="6" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ${theme.border};background:${theme.glassBg};color:#fff;font-size:13px;margin-bottom:16px;outline:none;resize:vertical;font-family:inherit;"></textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="profile-cancel" style="background:transparent;border:1px solid ${theme.border};color:${theme.textSecondary};padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">Annulla</button>
      <button id="profile-save" style="background:${theme.primary};border:none;color:white;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Salva</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  modal.querySelector('#profile-cancel')!.addEventListener('click', () => overlay.remove());
  modal.querySelector('#profile-save')!.addEventListener('click', () => {
    const name = (modal.querySelector<HTMLInputElement>('#profile-name')!).value.trim();
    const desc = (modal.querySelector<HTMLInputElement>('#profile-desc')!).value.trim();
    const instructions = (modal.querySelector<HTMLTextAreaElement>('#profile-instructions')!).value.trim();
    if (!name || !instructions) { showToast('Inserisci nome e istruzioni', 'warning'); return; }
    const colors = getFolderColors();
    const color = colors[Math.floor(Math.random() * colors.length)];
    addProfile(name, instructions, desc, color);
    overlay.remove();
    renderProfilesTab(document.getElementById('infolders-sidebar-content')!);
    showToast('Profilo creato!', 'success');
  });
}

function startGuidedTour(): void {
  const theme = currentTheme!;
  const steps = [
    { icon: 'star', title: 'Benvenuto in InFolders!', desc: 'Organizza le tue chat di ChatGPT, Gemini, Claude e Perplexity in cartelle. Salva bookmark, gestisci prompt e profili, tutto in un unico posto.', highlight: null },
    { icon: 'folder', title: 'Cartelle', desc: 'Crea cartelle e sottocartelle per organizzare le conversazioni. Trascina le chat con drag & drop, cambia colore alle cartelle e tienile sempre in ordine.', highlight: 'infolders-sidebar-btn' },
    { icon: 'bookmark', title: 'Bookmark', desc: 'Salva le chat importanti con un clic sul pulsante bookmark. Le trovi tutte nella sezione Bookmark, pronte per essere riaperte quando vuoi.', highlight: 'infolders-sidebar-btn' },
    { icon: 'file-text', title: 'Libreria Prompt', desc: 'Crea e salva i tuoi prompt preferiti categorizzati per argomento. Usali in qualsiasi chat con un clic, senza doverli riscrivere ogni volta.', highlight: 'infolders-sidebar-btn' },
    { icon: 'user-check', title: 'Profili Istruzioni', desc: 'Definisci profili con istruzioni personalizzate per ChatGPT. Attiva il profilo giusto per ogni contesto di lavoro o studio.', highlight: 'infolders-sidebar-btn' },
    { icon: 'settings', title: 'Impostazioni e Sync', desc: 'Dalla sezione Impostazioni puoi esportare, importare o cancellare i tuoi dati. I dati vengono sincronizzati automaticamente con il cloud se sei loggato.', highlight: 'infolders-sidebar-btn' },
    { icon: 'crown', title: 'Premium', desc: 'Sblocca chat illimitate, sincronizzazione multi-dispositivo e profili istruzioni personalizzati. Nessun limite, solo produttività.', highlight: null },
  ];

  let currentStep = 0;
  let overlay: HTMLElement | null = null;

  function renderStep(index: number): void {
    if (!overlay) return;
    const step = steps[index];
    const isFirst = index === 0;
    const isLast = index === steps.length - 1;

    const popup = overlay.querySelector('#infolders-tour-popup') as HTMLElement;
    popup.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px;">
        <div style="width:60px;height:60px;border-radius:16px;flex-shrink:0;background:${theme.appAccent}18;display:flex;align-items:center;justify-content:center;color:${theme.appAccent};">${LucideIcons.get(step.icon, 28)}</div>
        <div>
          <h3 style="margin:0 0 6px;font-size:17px;font-weight:700;color:${theme.textPrimary};letter-spacing:-0.3px;">${step.title}</h3>
          <p style="margin:0;color:${theme.textSecondary};font-size:13px;line-height:1.6;max-width:300px;">${step.desc}</p>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <span style="font-size:11px;color:${theme.textSecondary};font-weight:500;letter-spacing:0.5px;">${index + 1} / ${steps.length}</span>
          <div style="display:flex;gap:4px;align-items:center;">
            ${steps.map((_, i) => `<div style="width:${i === index ? '24px' : '6px'};height:6px;border-radius:3px;background:${i === index ? theme.appAccent : theme.border};transition:all 0.3s ease;"></div>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:8px;width:100%;margin-top:4px;">
          ${isFirst ? '' : `<button id="tour-prev" style="flex:1;background:transparent;border:1px solid ${theme.border};color:${theme.textSecondary};padding:10px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s ease;">Indietro</button>`}
          ${isLast ? `<button id="tour-finish" style="flex:1;background:${theme.appAccent};border:none;color:white;padding:10px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;box-shadow:0 4px 16px ${theme.appAccent}44;transition:all 0.2s ease;">Inizia!</button>` : `<button id="tour-next" style="flex:1;background:${theme.appAccent};border:none;color:white;padding:10px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;box-shadow:0 4px 16px ${theme.appAccent}44;transition:all 0.2s ease;">Avanti</button>`}
        </div>
        <button id="tour-skip" style="background:transparent;border:none;color:${theme.textSecondary};cursor:pointer;font-size:11px;text-decoration:underline;text-underline-offset:3px;opacity:0.6;">Salta guida</button>
      </div>
    `;

    popup.querySelector('#tour-skip')!.addEventListener('click', closeTour);
    const prevBtn = popup.querySelector('#tour-prev');
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    const nextBtn = popup.querySelector('#tour-next');
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));
    const finishBtn = popup.querySelector('#tour-finish');
    if (finishBtn) finishBtn.addEventListener('click', closeTour);
  }

  function goTo(index: number): void {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    renderStep(currentStep);
  }

  function closeTour(): void {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  overlay = document.createElement('div');
  overlay.id = 'infolders-tour-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'infoldersFadeIn 0.25s ease',
  });

  const popup = document.createElement('div');
  popup.id = 'infolders-tour-popup';
  Object.assign(popup.style, {
    background: theme.bg, border: `1px solid ${theme.glassBorder}`,
    borderRadius: '20px', padding: '32px 28px', width: '90%', maxWidth: '360px',
    color: 'white', boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
  });

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  renderStep(0);
}

function syncToSupabase(): void {
  if (!currentUser) return;
  saveUserData(currentUser.id, {
    folders,
    bookmarks,
    folderIdCounter,
    premiumData: infoldersPremium,
  }).catch((err: any) => {
    const msg = typeof err === 'object' && err !== null ? (err.message || 'riprova più tardi') : String(err);
    showToast('Errore sync cloud: ' + msg, 'error', 4000);
  });
}

function loginWithGoogle(): void {
  chrome.runtime.sendMessage({ action: 'loginWithGoogle' }, (response) => {
    if (chrome.runtime.lastError) {
      showToast('Errore login: ' + chrome.runtime.lastError.message, 'error');
      return;
    }
    if (response.error) {
      showToast('Errore login: ' + response.error, 'error');
      return;
    }
    if (response.token) {
      fetchUserInfo(response.token);
    }
  });
}

function fetchUserInfo(token: string): void {
  fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(async (user) => {
      currentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        verified_email: user.verified_email
      };
      chrome.storage.local.set({ currentUser });
      try {
        await signInWithGoogleToken(token);
      } catch (e) {
        console.error('Auth Supabase fallito:', e);
      }
      syncToSupabase();
      syncPremiumStatusFromSupabase();
      _reopeningSidebar = true;
      closeSidebar();
      setTimeout(() => { _reopeningSidebar = false; openSidebar(); }, 300);
    })
    .catch(() => showToast('Errore recupero info utente', 'error'));
}

function logout(): void {
  chrome.runtime.sendMessage({ action: 'logout' }, () => {
    currentUser = null;
    chrome.storage.local.remove(['currentUser']);
    _reopeningSidebar = true;
    closeSidebar();
    setTimeout(() => { _reopeningSidebar = false; openSidebar(); }, 300);
  });
}

function openPremiumPopup(): void {
  hideInPageButtons();
  const theme = currentTheme!;

  const overlay = document.createElement('div');
  overlay.id = 'infolders-premium-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
    zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: '0', transition: 'opacity 0.3s ease'
  });

  const popup = document.createElement('div');
  popup.id = 'infolders-premium-popup';
  Object.assign(popup.style, {
    background: theme.bg, border: `1px solid ${theme.glassBorder}`, borderRadius: '20px',
    padding: '0', maxWidth: '520px', width: '90%', maxHeight: '90vh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textAlign: 'center', position: 'relative',
    boxShadow: `0 24px 80px rgba(0,0,0,0.5), ${theme.buttonGlow}`,
    transform: 'translateY(20px) scale(0.97)',
    transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
  });

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #infolders-premium-scroll-body::-webkit-scrollbar { width: 6px; }
    #infolders-premium-scroll-body::-webkit-scrollbar-track { background: transparent; }
    #infolders-premium-scroll-body::-webkit-scrollbar-thumb { background: ${theme.appAccent}44; border-radius: 10px; }
    #infolders-premium-scroll-body::-webkit-scrollbar-thumb:hover { background: ${theme.appAccent}aa; }
  `;
  document.head.appendChild(styleEl);

  const plansCardsHtml = PLANS.map(plan => {
    const isPro = plan.id === 'pro';
    const borderStyle = isPro ? `1.5px solid ${theme.appAccent}66` : '1px solid rgba(255, 255, 255, 0.05)';
    const cardBg = isPro ? `linear-gradient(180deg, ${theme.appAccent}16 0%, ${theme.appAccent}03 100%)` : 'rgba(255, 255, 255, 0.02)';
    const cardShadow = isPro ? `0 8px 32px ${theme.appAccent}15` : 'none';
    const badgeHtml = plan.badge ? `<div style="position: absolute; top: -10px; right: 16px; background: ${theme.appAccent}; color: white; padding: 4px 14px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; box-shadow: 0 2px 8px ${theme.appAccent}44;">${plan.badge}</div>` : '';

    const featuresListHtml = plan.features.map(feat => {
      const icon = feat.included ? LucideIcons.get('check', 14) : `<span style="opacity:0.35;">${LucideIcons.get('x', 14)}</span>`;
      const color = feat.included ? theme.textSecondary : 'rgba(255,255,255,0.2)';
      const textStyle = feat.included ? '' : 'text-decoration:line-through;';
      return `<li style="display:flex;align-items:center;gap:8px;color:${color};${textStyle}"><span style="color:${feat.included ? theme.appAccent : theme.textSecondary};display:flex;align-items:center;flex-shrink:0;">${icon}</span><span>${feat.label}</span></li>`;
    }).join('');

    const btnStyle = isPro ? `width: 100%; background: linear-gradient(135deg, ${theme.appAccent}, ${theme.primary || theme.appAccent}); border: none; color: white; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; box-shadow: 0 4px 16px ${theme.appAccent}33;` : `width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: ${theme.textSecondary}; padding: 10px; border-radius: 10px; cursor: pointer; font-size: 13px;`;
    const btnLabel = plan.id === 'free' ? 'Piano attuale' : plan.ctaLabel;

    return `<div class="pricing-card" style="background: ${cardBg}; border: ${borderStyle}; border-radius: 14px; padding: 20px; text-align: left; position: relative; box-shadow: ${cardShadow};">${badgeHtml}<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;"><h3 style="color: ${theme.textPrimary}; margin: 0; font-size: 17px; font-weight: 700;">${plan.name}</h3><div style="font-size: 20px; font-weight: 600; color: #fff;"><span style="font-size:28px;color:#fff;">${plan.price.replace('€', '')}</span>€<span style="font-size:12px;color:#fff;font-weight:400;">/${plan.priceNote}</span></div></div><ul style="list-style: none; padding: 0; margin: 0 0 18px 0; font-size: 13px; line-height: 1.8; display:flex; flex-direction:column; gap:6px;">${featuresListHtml}</ul><button class="pricing-btn" data-plan="${plan.id}" style="${btnStyle}">${btnLabel}</button></div>`;
  }).join('');

  popup.innerHTML = `
    <div style="padding: 32px 32px 16px; flex-shrink: 0;">
      <div style="width:56px;height:56px;border-radius:16px;background:${theme.appAccent}22;border:1px solid ${theme.appAccent}44;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:${theme.appAccent};">${LucideIcons.get('crown', 28)}</div>
      <h2 style="color: white; margin: 0 0 4px; font-size: 22px; font-weight:700;">InFolders <span style="color:${theme.appAccent};">Premium</span></h2>
      <p style="color: ${theme.textSecondary}; margin: 0; font-size: 14px;">Scegli il piano perfetto per te</p>
    </div>
    <div id="infolders-premium-scroll-body" style="overflow-y: auto; padding: 0 32px 32px; flex: 1; display: flex; flex-direction: column; gap: 20px; color: white;">
      ${plansCardsHtml}
    </div>
  `;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.innerHTML = LucideIcons.get('x', 18);
  Object.assign(closeBtn.style, {
    position: 'absolute', top: '16px', right: '16px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: theme.textSecondary, cursor: 'pointer', padding: '6px',
    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  });
  closeBtn.addEventListener('click', () => { overlay.remove(); showInPageButtons(); });
  popup.appendChild(closeBtn);

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { overlay.remove(); showInPageButtons(); }
  });

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    popup.style.transform = 'translateY(0) scale(1)';
  });

  popup.querySelectorAll('.pricing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = (btn as HTMLElement).dataset.plan;
      if (plan === 'free') {
        showToast('Sei già sul piano Free.', 'info');
      } else if (plan === 'pro') {
        startStripeCheckout(plan);
      } else if (plan === 'team') {
        showTeamContactForm();
      }
      overlay.remove();
      showInPageButtons();
    });
  });
}

function showTeamContactForm(): void {
  const overlay = document.createElement('div');
  overlay.id = 'infolders-contact-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.6)', zIndex: '2147483646', display: 'flex',
    alignItems: 'center', justifyContent: 'center', opacity: '0',
    transition: 'opacity 0.25s ease', backdropFilter: 'blur(4px)'
  });

  const theme = currentTheme || { surface: '#1a1a2e', border: '#2a2a4a', textPrimary: '#eee', textSecondary: '#999', primary: '#6366f1' };

  const popup = document.createElement('div');
  popup.innerHTML = `
    <div style="background:${theme.surface};border:1px solid ${theme.border};border-radius:14px;padding:24px;width:380px;max-width:90vw;position:relative;">
      <button id="infolders-contact-close" style="position:absolute;top:12px;right:12px;background:none;border:none;color:${theme.textSecondary};cursor:pointer;font-size:20px;">×</button>
      <h3 style="color:${theme.textPrimary};margin:0 0 16px;font-size:18px;">Richiedi piano Team</h3>
      <form id="infolders-contact-form">
        <input type="text" name="name" placeholder="Nome e cognome" required style="width:100%;padding:10px;margin-bottom:10px;border-radius:8px;border:1px solid ${theme.border};background:rgba(255,255,255,0.05);color:${theme.textPrimary};font-size:14px;box-sizing:border-box;">
        <input type="email" name="email" placeholder="La tua email" required style="width:100%;padding:10px;margin-bottom:10px;border-radius:8px;border:1px solid ${theme.border};background:rgba(255,255,255,0.05);color:${theme.textPrimary};font-size:14px;box-sizing:border-box;">
        <textarea name="message" placeholder="Descrivi le tue esigenze..." required rows="4" style="width:100%;padding:10px;margin-bottom:12px;border-radius:8px;border:1px solid ${theme.border};background:rgba(255,255,255,0.05);color:${theme.textPrimary};font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
        <button type="submit" style="width:100%;padding:10px;border:none;border-radius:8px;background:${theme.primary};color:white;font-size:14px;cursor:pointer;font-weight:600;">Invia richiesta</button>
      </form>
      <div id="infolders-contact-status" style="margin-top:10px;font-size:13px;color:${theme.textSecondary};"></div>
    </div>
  `;

  popup.querySelector('#infolders-contact-close')!.addEventListener('click', () => overlay.remove());
  popup.querySelector('form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const status = popup.querySelector('#infolders-contact-status') as HTMLElement;
    status.textContent = 'Invio in corso...';
    (form.querySelector('button[type="submit"]') as HTMLButtonElement).disabled = true;
    try {
      await sendTeamContact({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        message: formData.get('message') as string,
      });
      status.textContent = 'Richiesta inviata con successo! Ti contatteremo presto.';
      status.style.color = '#22c55e';
      form.querySelector('button[type="submit"]')!.remove();
    } catch (err: any) {
      status.textContent = err.message || 'Errore invio. Riprova più tardi.';
      status.style.color = '#ef4444';
      (form.querySelector('button[type="submit"]') as HTMLButtonElement).disabled = false;
    }
  });

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  requestAnimationFrame(() => overlay.style.opacity = '1');
}

const BOOKMARK_CHATGPT_SPEC = {
  anchorSelectors: ['aside a[href*="/c/"]', 'nav a[href*="/c/"]'],
  hrefTest: (href: string) => /\/c\/[a-f0-9-]{8,}/i.test(href || ''),
  inSidebar: (a: Element) => a.closest('aside') || a.closest('nav') || a.closest('[data-testid*="sidebar"]')
};

const BOOKMARK_CLAUDE_SPEC = {
  anchorSelectors: ['aside a[href*="/chat/"]', 'nav a[href*="/chat/"]', '[class*="sidebar" i] a[href*="/chat/"]', '[class*="SideNav" i] a[href*="/chat/"]', 'a[href^="/chat/"]'],
  hrefTest: (href: string) => {
    try { const u = new URL(href, location.href); const host = u.hostname || ''; return (host === 'claude.ai' || host.endsWith('.claude.ai')) && /\/chat\/[^/?#]+/.test(u.pathname); } catch { return false; }
  },
  inSidebar: (a: Element) => a.closest('aside') || a.closest('nav') || a.closest('[class*="sidebar" i]') || a.closest('[class*="SideNav" i]')
};

const BOOKMARK_GEMINI_SPEC = {
  anchorSelectors: ['aside a[href*="/app/"]', 'nav a[href*="/app/"]', 'div[role="navigation"] a[href*="/app/"]', 'a[href*="gemini.google.com/app/"]'],
  hrefTest: (href: string) => { try { const u = new URL(href, location.href); return u.hostname.includes('gemini.google') && /\/app\//.test(u.pathname); } catch { return false; } },
  inSidebar: (a: Element) => a.closest('aside') || a.closest('nav') || a.closest('div[role="navigation"]') || a.closest('[class*="sidenav" i]') || a.closest('[class*="side-nav" i]') || a.closest('[role="complementary"]')
};

const BOOKMARK_HOST_SPECS: Record<string, any> = {
  'chatgpt.com': BOOKMARK_CHATGPT_SPEC,
  'chat.openai.com': BOOKMARK_CHATGPT_SPEC,
  'claude.ai': BOOKMARK_CLAUDE_SPEC,
  'gemini.google.com': BOOKMARK_GEMINI_SPEC,
};

function collectBookmarkAnchors(selectors: string[]): HTMLAnchorElement[] {
  const seen = new Set<HTMLAnchorElement>();
  const out: HTMLAnchorElement[] = [];
  for (const sel of selectors) {
    try {
      document.querySelectorAll(sel).forEach((node) => {
        const a = node.tagName === 'A' ? (node as HTMLAnchorElement) : node.closest?.('a');
        if (!a || a.tagName !== 'A' || !a.href || seen.has(a)) return;
        seen.add(a);
        out.push(a);
      });
    } catch { }
  }
  return out;
}

function findChatRow(anchor: HTMLAnchorElement): HTMLElement | null {
  const sidebar = (() => {
    const spec = BOOKMARK_HOST_SPECS[window.location.hostname];
    return spec?.inSidebar(anchor) || null;
  })();
  if (!sidebar) return null;

  let el: HTMLElement | null = anchor;
  for (let i = 0; i < 5; i++) {
    if (!el) break;
    el = el.parentElement;
    if (!el || el === sidebar || el === document.body) break;
    const tag = el.tagName.toLowerCase();
    if (tag === 'li' || tag === 'article') return el;
    if (el.getAttribute('role') === 'option' || el.getAttribute('role') === 'listitem') return el;
    if (el.dataset?.testId || el.dataset?.testid) return el;
    if (el.className && typeof el.className === 'string' && /(chat|conversation|thread|item|row)/i.test(el.className)) return el;
  }
  const parent = anchor.parentElement;
  if (parent && parent !== sidebar && parent !== document.body) return parent;
  return sidebar as HTMLElement;
}

let _bookmarkBtnTimer: ReturnType<typeof setTimeout> | null = null;

function injectBookmarkButtons(): void {
  try {
    const config = getPlatformConfig();
    if (!config) return;
    const spec = BOOKMARK_HOST_SPECS[window.location.hostname];
    if (!spec) return;
    const theme = config.theme;
    const anchors = collectBookmarkAnchors(spec.anchorSelectors);
    anchors.forEach((anchor) => {
      if (!spec.hrefTest(anchor.href || '')) return;
      const row = findChatRow(anchor);
      if (!row || row.querySelector('.infolders-bookmark-wrap')) return;
      row.classList.add('infolders-chat-row');

      const wrap = document.createElement('span');
      wrap.className = 'infolders-bookmark-wrap';
      Object.assign(wrap.style, {
        opacity: '0',
        pointerEvents: 'none',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: '0',
        marginRight: '8px',
        transform: 'scale(0.85)'
      });

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = 'Aggiungi a Bookmarks';
      Object.assign(btn.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
        background: 'transparent',
        cursor: 'pointer',
        border: 'none',
        color: `${theme.primary}cc`,
        transition: 'all 0.2s ease'
      });
      const bookmarkSvg = LucideIcons.element('bookmark', 14);
      btn.appendChild(bookmarkSvg);

      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.15)';
        btn.style.color = '#fff';
        bookmarkSvg.style.filter = 'drop-shadow(0 0 6px currentColor)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
        btn.style.color = `${theme.primary}cc`;
        bookmarkSvg.style.filter = 'none';
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const name = anchor.innerText?.trim() || anchor.textContent?.trim() || 'Chat';
        const url = normalizeUrl(anchor.href || '');
        addBookmark(name, url, config.name);
        btn.innerHTML = '';
        btn.style.color = '#22c55e';
        const checkSvg = LucideIcons.element('check', 14);
        btn.appendChild(checkSvg);
        if (_bookmarkBtnTimer) clearTimeout(_bookmarkBtnTimer);
        _bookmarkBtnTimer = setTimeout(() => {
          btn.innerHTML = '';
          btn.style.color = `${theme.primary}cc`;
          const restoredSvg = LucideIcons.element('bookmark', 14);
          btn.appendChild(restoredSvg);
          _bookmarkBtnTimer = null;
        }, 1500);
      });

      wrap.appendChild(btn);
      row.insertBefore(wrap, anchor);
    });
  } catch (e) {
    console.warn('InFolders injectBookmarkButtons:', e);
  }
}

chrome.storage.onChanged.addListener((changes, ns) => {
  if (ns === 'local') {
    if (changes.currentUser) {
      currentUser = changes.currentUser.newValue as UserProfile | null;
      if (isSidebarOpen) { rebuildTabBar(); switchTab('account'); }
    }
    if (changes.infolders_bookmarks) {
      bookmarks = (changes.infolders_bookmarks.newValue as Bookmark[]) || [];
      if (isSidebarOpen) {
        const container = document.getElementById('infolders-sidebar-content');
        if (container) renderBookmarksList(container);
      }
    }
    if (changes.infolders_premium) {
      infoldersPremium = (changes.infolders_premium.newValue as PremiumSubscription | null) || null;
    }
  }
});

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function refreshAllFolderViews(): void {
  const sidebarContainer = document.getElementById('infolders-sidebar-content');
  if (sidebarContainer) {
    renderFoldersList(sidebarContainer);
  }
  const inPageInput = document.querySelector('#infolders-inpage-folders-section input[type="search"]') as HTMLInputElement;
  const query = inPageInput ? inPageInput.value : '';
  renderInPageFoldersList(query);
}

function renderInPageFoldersList(query: string): void {
  const list = document.getElementById('infolders-inpage-folders-list');
  if (!list) return;
  list.innerHTML = '';
  
  const q = (query || '').trim();
  const tree = q ? filterFolderTreeByQuery(folders, q) : folders;
  
  if (tree.length === 0 && q) {
    list.innerHTML = `<div style="text-align:center;padding:16px 8px;"><span style="color:${currentTheme!.textSecondary};font-size:12px;">Nessun risultato</span></div>`;
    return;
  }
  
  tree.forEach((folder) => {
    list.appendChild(createFolderElement(folder, list, 0));
  });
}

function injectInPageFoldersSection(): void {
  try {
    const config = getPlatformConfig();
    if (!config) return;
    const spec = BOOKMARK_HOST_SPECS[window.location.hostname];
    if (!spec) return;
    
    if (document.getElementById('infolders-inpage-folders-section')) {
      return;
    }
    
    let targetContainer: HTMLElement | null = null;
    let referenceElement: HTMLElement | null = null;
    
    const anchors = collectBookmarkAnchors(spec.anchorSelectors);
    if (anchors.length > 0) {
      const row = spec.inSidebar(anchors[0])?.closest('li, div') as HTMLElement;
      if (row && row.parentElement) {
        targetContainer = row.parentElement;
        referenceElement = row;
      }
    }
    
    if (!targetContainer) {
      targetContainer = document.querySelector('nav') || document.querySelector('aside') || document.querySelector('[role="navigation"]');
    }
    
    if (!targetContainer) return;
    
    const theme = config.theme;
    
    const section = document.createElement('div');
    section.id = 'infolders-inpage-folders-section';
    Object.assign(section.style, {
      padding: '12px 14px',
      marginBottom: '16px',
      borderBottom: `1px solid ${theme.border}22`,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    
    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    });
    
    const title = document.createElement('span');
    title.textContent = 'Folders';
    Object.assign(title.style, {
      color: theme.textPrimary || '#ffffff',
      fontSize: '13px',
      fontWeight: '600',
      letterSpacing: '0.3px'
    });
    
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.title = 'Nuova cartella';
    addBtn.innerHTML = LucideIcons.get('plus', 14);
    Object.assign(addBtn.style, {
      background: 'transparent',
      border: 'none',
      color: theme.appAccent || '#a855f7',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '4px',
      transition: 'background 0.2s ease'
    });
    addBtn.addEventListener('mouseenter', () => {
      addBtn.style.background = theme.surfaceHover || 'rgba(255,255,255,0.08)';
    });
    addBtn.addEventListener('mouseleave', () => {
      addBtn.style.background = 'transparent';
    });
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addRootFolderFromSidebar();
    });
    
    header.appendChild(title);
    header.appendChild(addBtn);
    section.appendChild(header);
    
    const searchWrapper = document.createElement('div');
    Object.assign(searchWrapper.style, {
      position: 'relative',
      width: '100%'
    });
    
    const searchIcon = document.createElement('span');
    searchIcon.innerHTML = LucideIcons.get('search', 12);
    Object.assign(searchIcon.style, {
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.textSecondary || '#a1a1aa',
      pointerEvents: 'none',
      display: 'flex'
    });
    
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Cerca cartelle...';
    Object.assign(searchInput.style, {
      width: '100%',
      boxSizing: 'border-box',
      padding: '8px 10px 8px 30px',
      borderRadius: '8px',
      border: `1px solid ${theme.border}44`,
      background: theme.glassBg || 'rgba(0,0,0,0.2)',
      color: '#fff',
      fontSize: '12px',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    });
    
    searchInput.addEventListener('focus', () => {
      searchInput.style.borderColor = theme.appAccent;
    });
    searchInput.addEventListener('blur', () => {
      searchInput.style.borderColor = `${theme.border}44`;
    });
    searchInput.addEventListener('input', () => {
      renderInPageFoldersList(searchInput.value);
    });
    
    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);
    section.appendChild(searchWrapper);
    
    const foldersList = document.createElement('div');
    foldersList.id = 'infolders-inpage-folders-list';
    Object.assign(foldersList.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      maxHeight: '300px',
      overflowY: 'auto',
      paddingRight: '4px'
    });
    section.appendChild(foldersList);
    
    if (referenceElement) {
      targetContainer.insertBefore(section, referenceElement);
    } else {
      targetContainer.insertBefore(section, targetContainer.firstChild);
    }
    
    renderInPageFoldersList('');
  } catch (err) {
    console.warn('InFolders injectInPageFoldersSection error:', err);
  }
}

setTimeout(init, 2000);

let _observerTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedInject(): void {
  if (_observerTimer) clearTimeout(_observerTimer);
  _observerTimer = setTimeout(() => {
    _observerTimer = null;
    injectBookmarkButtons();
    injectInPageFoldersSection();
  }, 150);
}

new MutationObserver(() => {
  try { debouncedInject(); } catch (e) { console.warn('InFolders observer:', e); }
}).observe(document.body, { childList: true, subtree: true, attributes: false });

let _scrollTimer: ReturnType<typeof setTimeout> | null = null;
document.addEventListener('scroll', () => {
  if (_scrollTimer) clearTimeout(_scrollTimer);
  _scrollTimer = setTimeout(() => {
    _scrollTimer = null;
    injectBookmarkButtons();
  }, 300);
}, { passive: true, capture: true });

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentUser) {
    syncPremiumStatusFromSupabase();
    injectBookmarkButtons();
  }
});