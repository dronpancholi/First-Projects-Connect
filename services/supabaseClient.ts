
import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'fpc_supabase_config';

// Default credentials provided by user
const DEFAULT_URL = 'https://dublfowbviweyuauecma.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Ymxmb3didml3ZXl1YXVlY21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzYzMzYsImV4cCI6MjA4MTU1MjMzNn0.h7H9RNVOqpDT0CtUZTAOweGvMtlpTKlSQ4OqYm7SoI4';

export const getSupabaseConfig = () => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.key) return parsed;
    }
  } catch (e) {
    console.warn('FPC: Local storage access restricted or config corrupt.');
  }
  return {
    url: DEFAULT_URL,
    key: DEFAULT_KEY
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, key }));
    window.location.reload();
  } catch (e) {
    alert('Failed to save configuration. Local storage may be disabled.');
  }
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};

const createSafeClient = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key || !url.startsWith('http')) {
    console.error('FPC: Supabase client cannot be initialized with missing URL/Key.');
    return null;
  }
  try {
    return createClient(url, key);
  } catch (e) {
    console.error('FPC: Failed to instantiate Supabase client:', e);
    return null;
  }
};

// Initialize client. If it fails, the app should handle null state gracefully.
export const supabase = createSafeClient() as ReturnType<typeof createClient>;
