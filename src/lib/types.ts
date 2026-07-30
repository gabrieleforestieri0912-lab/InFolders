export interface Chat {
  name: string;
  url: string;
  platform: string;
}

export interface FolderNode {
  id: number;
  name: string;
  subfolders: FolderNode[];
  chats: Chat[];
  color?: string;
  icon?: string;
}

export interface Bookmark {
  id: number;
  name: string;
  url: string;
  platform: string;
  addedAt: string;
}

export interface PremiumSubscription {
  premium: boolean;
  plan: 'pro' | 'team';
  price: string;
  active: boolean;
  startDate: string;
  trialEnds: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export interface UserData {
  userId: string;
  email?: string;
  name?: string;
  picture?: string;
  folders: FolderNode[];
  bookmarks: Bookmark[];
  folderIdCounter: number;
  premiumData: PremiumSubscription | null;
}

export interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface InstructionProfile {
  id: number;
  name: string;
  instructions: string;
  description: string;
  color: string;
}

export type TabId = 'account' | 'tools' | 'folders' | 'bookmarks' | 'prompts' | 'profiles';

export type LanguageCode = 'it' | 'en';

export interface LanguageData {
  name: string;
  nativeName: string;
  strings: Record<string, string>;
}

export interface PlatformTheme {
  primary: string;
  secondary: string;
  accent: string;
  appAccent: string;
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  buttonGlow: string;
  badgeColor: string;
  textPrimary: string;
  textSecondary: string;
  glassBg: string;
  glassBorder: string;
}

export interface PlatformConfig {
  name: string;
  apiUrl: string;
  sidebarPosition: 'left' | 'right';
  theme: PlatformTheme;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  userId: string;
  folders: FolderNode[];
  folderIdCounter: number;
  bookmarks?: Bookmark[];
}

export type ToastType = 'info' | 'success' | 'error' | 'warning';
