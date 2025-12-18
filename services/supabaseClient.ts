
import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'fpc_supabase_config';

// Default internal credentials for initial startup
const DEFAULT_URL = 'https://dublfowbviweyuauecma.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Ymxmb3didml3ZXl1YXVlY21hIiwicm9sZSI6ImR1Ymxmb3didml3ZXl1YXVlY21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzYzMzYsImV4cCI6MjA4MTU1MjMzNn0.h7H9RNVOqpDT0CtUZTAOweGvMtlpTKlSQ4OqYm7SoI4';

export const getSupabaseConfig = () => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Basic URL and key validation
      if (parsed.url && parsed.key && typeof parsed.url === 'string' && parsed.url.startsWith('http')) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('FPC System: Local storage configuration access failed. Falling back to default.');
  }
  return {
    url: DEFAULT_URL,
    key: DEFAULT_KEY
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  try {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      throw new Error("Invalid Supabase Endpoint URL. Must start with http/https.");
    }
    if (!key || typeof key !== 'string' || key.length < 10) {
      throw new Error("Invalid API Key format.");
    }
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, key }));
    window.location.reload();
  } catch (e: any) {
    alert(`Configuration Refused: ${e.message}`);
    console.error('FPC Config Error:', e);
  }
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
};

const createSafeClient = () => {
  const config = getSupabaseConfig();
  
  if (!config.url || !config.key || !config.url.startsWith('http')) {
    console.warn('FPC System: Supabase configuration is invalid. Persistent data features will be disabled.');
    return null;
  }
  
  try {
    return createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (e) {
    console.error('FPC System: Failed to instantiate Supabase client:', e);
    return null;
  }
};

// Singleton safe client instance
export const supabase = createSafeClient() as ReturnType<typeof createClient>;
