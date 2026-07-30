/// <reference types="@types/chrome" />

declare namespace chrome {
  export var storage: ChromeStorage;
  export var runtime: ChromeRuntime;
  export var tabs: ChromeTabs;
  export var action: ChromeAction;
  export var identity: ChromeIdentity;
}

interface ChromeStorage {
  local: {
    get(keys: string | string[] | Record<string, any> | null, callback: (items: Record<string, any>) => void): void;
    set(items: Record<string, any>, callback?: () => void): void;
    remove(keys: string | string[], callback?: () => void): void;
    onChanged: {
      addListener(callback: (changes: Record<string, { oldValue?: any; newValue?: any }>, namespace: string) => void): void;
    };
  };
}

interface ChromeRuntime {
  sendMessage(message: any, callback?: (response: any) => void): void;
  onMessage: {
    addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void | boolean): void;
  };
  onStartup: {
    addListener(callback: () => void): void;
  };
  onInstalled: {
    addListener(callback: () => void): void;
  };
  getManifest(): any;
  lastError?: { message: string };
}

interface ChromeTabs {
  create(createProperties: { url?: string; active?: boolean }): void;
}

interface ChromeAction {
  setBadgeText(details: { text: string }, callback?: () => void): void;
  setBadgeBackgroundColor(details: { color: string }, callback?: () => void): void;
}

interface ChromeIdentity {
  getRedirectURL(path?: string): string;
  launchWebAuthFlow(details: { url: string; interactive: boolean }, callback: (responseUrl?: string) => void): void;
  getAuthToken(details: { interactive: boolean }, callback: (token?: string) => void): void;
  removeCachedAuthToken(details: { token: string }, callback?: () => void): void;
}
