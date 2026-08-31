"use strict";
(() => {
  // src/extension/lib/config.ts
  var SUPABASE_URL = "https://wpxcspnugzmkllwedwgz.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweGNzcG51Z3pta2xsd2Vkd2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzUzNDcsImV4cCI6MjA5NjY1MTM0N30.RpT_-biT3zogGKJWE5b__QKRfJpnf-6qGbXLiTNnqkU";

  // src/extension/background.ts
  var FREE_CHAT_LIMIT = 50;
  function isPremiumStorage(value) {
    if (!value) return false;
    if (value === true) return true;
    if (typeof value !== "object") return false;
    if (value.premium === true) return true;
    if (value.active === true) return true;
    if (value.active !== false && value.plan && (value.plan === "pro" || value.plan === "team")) return true;
    return false;
  }
  var foldersCache = {};
  var folderIdCounters = {};
  function loadAllData() {
    chrome.storage.local.get(null, (all) => {
      Object.keys(all).forEach((key) => {
        if (key.startsWith("folders_")) {
          const uid = key.replace("folders_", "");
          foldersCache[uid] = all[key];
        }
        if (key.startsWith("folderIdCounter_")) {
          const uid = key.replace("folderIdCounter_", "");
          folderIdCounters[uid] = all[key];
        }
      });
      console.log("InFolders: Caricati", Object.keys(foldersCache).length, "utenti");
    });
  }
  chrome.runtime.onStartup.addListener(loadAllData);
  chrome.runtime.onInstalled.addListener(loadAllData);
  loadAllData();
  chrome.runtime.onMessage.addListener((req, sender, respond) => {
    switch (req.action) {
      case "addChat":
        handleAddChat(req.chat).then(() => {
          updateBadge();
          respond({ success: true });
        }).catch((err) => respond({ success: false, error: err.message }));
        return true;
      case "getFolders":
        handleGetFolders(respond);
        return true;
      case "saveFolders":
        handleSaveFolders(req.userId, req.folders, req.counter);
        respond({ success: true });
        return true;
      case "getBookmarks":
        chrome.storage.local.get(["infolders_bookmarks"], (res) => {
          respond({ bookmarks: res.infolders_bookmarks || [] });
        });
        return true;
      case "saveBookmarks":
        chrome.storage.local.set({ infolders_bookmarks: req.bookmarks }, () => {
          respond({ success: true });
        });
        return true;
      case "loginWithGoogle":
        handleGoogleLogin().then((token) => respond({ token })).catch((err) => respond({ error: err.message }));
        return true;
      case "logout":
        handleLogout().then(() => respond({ success: true })).catch((err) => respond({ error: err.message }));
        return true;
      case "supabaseAuth":
        handleSupabaseAuth(req.op, req.body).then((data) => respond({ data })).catch((err) => respond({ error: err.message }));
        return true;
    }
  });
  async function handleSupabaseAuth(op, body) {
    const headers = {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    };
    const url = op === "signInWithIdToken" ? `${SUPABASE_URL}/auth/v1/token?grant_type=id_token` : `${SUPABASE_URL}/auth/v1/${op}`;
    const stored = await chrome.storage.local.get(["supabase_session"]);
    const accessToken = stored?.supabase_session?.access_token;
    if (accessToken && op !== "signInWithIdToken") {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    const text = await res.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { raw: text };
    }
    if (!res.ok) {
      const msg = payload?.msg || payload?.error_description || payload?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    if (payload?.access_token && payload?.refresh_token) {
      await chrome.storage.local.set({ supabase_session: payload });
    }
    if (op === "logout") {
      await chrome.storage.local.remove(["supabase_session"]);
    }
    return payload;
  }
  function handleGoogleLogin() {
    return new Promise((resolve, reject) => {
      const oauth = chrome.runtime.getManifest().oauth2;
      if (!oauth || !oauth.client_id) {
        return reject(new Error("OAuth non configurato nel manifest."));
      }
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", oauth.client_id);
      authUrl.searchParams.set("response_type", "id_token");
      authUrl.searchParams.set("redirect_uri", chrome.identity.getRedirectURL());
      console.log("[InFolders] Login Google", {
        clientId: oauth.client_id,
        redirectUri: chrome.identity.getRedirectURL(),
        extensionId: chrome.runtime.id
      });
      authUrl.searchParams.set("scope", "openid email profile");
      authUrl.searchParams.set("nonce", crypto.randomUUID());
      authUrl.searchParams.set("prompt", "consent");
      chrome.identity.launchWebAuthFlow(
        { url: authUrl.toString(), interactive: true },
        (responseUrl) => {
          if (chrome.runtime.lastError) {
            const raw = chrome.runtime.lastError.message || "";
            return reject(new Error(translateOAuthError(raw, oauth)));
          }
          try {
            const url = new URL(responseUrl);
            const hashParams = new URLSearchParams(url.hash.substring(1));
            const token = hashParams.get("id_token");
            if (token) resolve(token);
            else reject(new Error("Token non ricevuto"));
          } catch (e) {
            reject(new Error("Errore nella risposta OAuth"));
          }
        }
      );
    });
  }
  function translateOAuthError(raw, oauth) {
    const msg = String(raw || "");
    const clientId = oauth && oauth.client_id ? oauth.client_id : "sconosciuto";
    if (/redirect_uri_mismatch/i.test(msg)) {
      return `OAuth non configurato: il redirect URI ${chrome.identity.getRedirectURL()} non è autorizzato per il client ${clientId}. Nella Google Cloud Console, crea un client OAuth di tipo "Chrome extension" con l'ID esatto di questa estensione (chrome://extensions).`;
    }
    if (/invalid_client|client_id|unauthorized_client/i.test(msg)) {
      return `Client OAuth non valido (${clientId}): verifica che esista nella Google Cloud Console e che il tipo sia "Chrome extension".`;
    }
    if (/access_denied|consent/i.test(msg)) {
      return "Accesso annullato o consenso negato. Riprova.";
    }
    return msg;
  }
  function handleLogout() {
    return new Promise((resolve) => {
      const done = () => {
        chrome.storage.local.remove(["currentUser", "supabase_session"], () => resolve());
      };
      if (chrome.identity.clearAllCachedAuthTokens) {
        chrome.identity.clearAllCachedAuthTokens(done);
      } else {
        done();
      }
    });
  }
  function handleAddChat(chat) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["currentUser", "infolders_premium"], (res) => {
        const user = res.currentUser;
        if (!user) return reject(new Error("Accedi per aggiungere chat alle cartelle."));
        const uid = user.id;
        const list = foldersCache[uid] || [];
        const counter = folderIdCounters[uid] || 0;
        if (!isPremiumStorage(res.infolders_premium) && countChats(list) >= FREE_CHAT_LIMIT) {
          return reject(
            new Error(`Limite ${FREE_CHAT_LIMIT} chat (piano Free). Attiva Pro per chat illimitate.`)
          );
        }
        const platform = chat.platform || "Generico";
        let folder = list.find((f) => f.name === platform);
        if (!folder) {
          let newCounter = counter;
          folder = { id: ++newCounter, name: platform, subfolders: [], chats: [], updatedAt: new Date().toISOString() };
          list.push(folder);
          folderIdCounters[uid] = newCounter;
        }
        folder.chats.push(chat);
        folder.updatedAt = new Date().toISOString();
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
  function handleGetFolders(sendResponse) {
    chrome.storage.local.get(["currentUser"], (res) => {
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
  function handleSaveFolders(uid, list, counter) {
    foldersCache[uid] = list;
    folderIdCounters[uid] = counter;
    chrome.storage.local.set({
      [`folders_${uid}`]: list,
      [`folderIdCounter_${uid}`]: counter
    });
  }
  function countChats(folderList) {
    let total = 0;
    function walk(list) {
      list.forEach((f) => {
        total += f.chats?.length || 0;
        if (f.subfolders) walk(f.subfolders);
      });
    }
    walk(folderList);
    return total;
  }
  function updateBadge() {
    chrome.storage.local.get(["currentUser"], (res) => {
      const user = res.currentUser;
      if (!user) {
        chrome.action.setBadgeText({ text: "" });
        return;
      }
      const total = countChats(foldersCache[user.id] || []);
      if (total > 0) {
        chrome.action.setBadgeText({ text: String(total > 99 ? "99+" : total) });
        chrome.action.setBadgeBackgroundColor({ color: "#7c3aed" });
      } else {
        chrome.action.setBadgeText({ text: "" });
      }
    });
  }
  chrome.runtime.onStartup.addListener(() => {
    chrome.action.setBadgeText({ text: "" });
  });
})();
