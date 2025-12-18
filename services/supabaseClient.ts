
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
    console.warn('FPC System: Local storage access restricted or config corrupted.');
  }
  return {
    url: DEFAULT_URL,
    key: DEFAULT_KEY
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  try {
    if (!url || !url.startsWith('http')) {
      throw new Error("Invalid Supabase URL format.");
    }
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, key }));
    window.location.reload();
  } catch (e: any) {
    alert(`Configuration Failure: ${e.message}`);
  }
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
};

const createSafeClient = () => {
  const { url, key } = getSupabaseConfig();
  
  if (!url || !key || !url.startsWith('http')) {
    console.warn('FPC System: Supabase configuration incomplete. Authenticated features disabled.');
    return null;
  }
  
  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (e) {
    console.error('FPC System: Critical failure during Supabase instantiation:', e);
    return null;
  }
};

// Singleton safe client export
export const supabase = createSafeClient() as ReturnType<typeof createClient>;
