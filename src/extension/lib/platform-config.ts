import type { PlatformConfig } from '../../lib/types';

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  'chat.openai.com': {
    name: 'ChatGPT',
    apiUrl: 'https://chat.openai.com',
    sidebarPosition: 'right',
    theme: {
      primary: '#a855f7',
      secondary: '#c084fc',
      accent: '#d8b4fe',
      appAccent: '#a855f7',
      bg: '#000000',
      surface: 'rgba(168, 85, 247, 0.12)',
      surfaceHover: 'rgba(168, 85, 247, 0.2)',
      border: 'rgba(168, 85, 247, 0.3)',
      buttonGlow: '0 0 20px rgba(168, 85, 247, 0.35)',
      badgeColor: '#c084fc',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      glassBg: '#0a0a0a',
      glassBorder: 'rgba(168, 85, 247, 0.15)'
    }
  },
  'chatgpt.com': {
    name: 'ChatGPT',
    apiUrl: 'https://chatgpt.com',
    sidebarPosition: 'right',
    theme: {
      primary: '#a855f7',
      secondary: '#c084fc',
      accent: '#d8b4fe',
      appAccent: '#a855f7',
      bg: '#000000',
      surface: 'rgba(168, 85, 247, 0.12)',
      surfaceHover: 'rgba(168, 85, 247, 0.2)',
      border: 'rgba(168, 85, 247, 0.3)',
      buttonGlow: '0 0 20px rgba(168, 85, 247, 0.35)',
      badgeColor: '#c084fc',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      glassBg: '#0a0a0a',
      glassBorder: 'rgba(168, 85, 247, 0.15)'
    }
  },
  'gemini.google.com': {
    name: 'Gemini',
    apiUrl: 'https://gemini.google.com',
    sidebarPosition: 'right',
    theme: {
      primary: '#60a5fa',
      secondary: '#93c5fd',
      accent: '#bfdbfe',
      appAccent: '#60a5fa',
      bg: '#000000',
      surface: 'rgba(96, 165, 250, 0.12)',
      surfaceHover: 'rgba(96, 165, 250, 0.2)',
      border: 'rgba(96, 165, 250, 0.3)',
      buttonGlow: '0 0 20px rgba(96, 165, 250, 0.35)',
      badgeColor: '#93c5fd',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      glassBg: '#0a0a0a',
      glassBorder: 'rgba(96, 165, 250, 0.15)'
    }
  },
  'claude.ai': {
    name: 'Claude',
    apiUrl: 'https://claude.ai',
    sidebarPosition: 'right',
    theme: {
      primary: '#fb923c',
      secondary: '#fdba74',
      accent: '#fed7aa',
      appAccent: '#fb923c',
      bg: '#000000',
      surface: 'rgba(251, 146, 60, 0.12)',
      surfaceHover: 'rgba(251, 146, 60, 0.2)',
      border: 'rgba(251, 146, 60, 0.3)',
      buttonGlow: '0 0 20px rgba(251, 146, 60, 0.35)',
      badgeColor: '#fdba74',
      textPrimary: '#ffffff',
      textSecondary: '#a39188',
      glassBg: '#0a0a0a',
      glassBorder: 'rgba(251, 146, 60, 0.15)'
    }
  },
  'perplexity.ai': {
    name: 'Perplexity',
    apiUrl: 'https://perplexity.ai',
    sidebarPosition: 'right',
    theme: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      accent: '#67e8f9',
      appAccent: '#06b6d4',
      bg: '#000000',
      surface: 'rgba(6, 182, 212, 0.12)',
      surfaceHover: 'rgba(6, 182, 212, 0.2)',
      border: 'rgba(6, 182, 212, 0.3)',
      buttonGlow: '0 0 20px rgba(6, 182, 212, 0.35)',
      badgeColor: '#22d3ee',
      textPrimary: '#ffffff',
      textSecondary: '#8b9ead',
      glassBg: '#0a0a0a',
      glassBorder: 'rgba(6, 182, 212, 0.15)'
    }
  },
  'www.perplexity.ai': {
    name: 'Perplexity',
    apiUrl: 'https://www.perplexity.ai',
    sidebarPosition: 'right',
    theme: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      accent: '#67e8f9',
      appAccent: '#06b6d4',
      bg: '#000000',
      surface: 'rgba(6, 182, 212, 0.12)',
      surfaceHover: 'rgba(6, 182, 212, 0.2)',
      border: 'rgba(6, 182, 212, 0.3)',
      buttonGlow: '0 0 20px rgba(6, 182, 212, 0.35)',
      badgeColor: '#22d3ee',
      textPrimary: '#ffffff',
      textSecondary: '#8b9ead',
      glassBg: '#0a0a0a',
      glassBorder: 'rgba(34, 197, 94, 0.15)'
    }
  }
};

export function getPlatformConfig(): PlatformConfig | undefined {
  if (typeof window === 'undefined' || !window.location) return undefined;
  return PLATFORM_CONFIGS[window.location.hostname];
}
