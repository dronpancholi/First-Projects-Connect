
import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'fpc_supabase_config';

// Default credentials provided by user
const DEFAULT_URL = 'https://dublfowbviweyuauecma.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Ymxmb3didml3ZXl1YXVlY21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzYzMzYsImV4cCI6MjA4MTU1MjMzNn0.h7H9RNVOqpDT0CtUZTAOweGvMtlpTKlSQ4OqYm7SoI4';

export const getSupabaseConfig = () => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored supabase config');
    }
  }
  return {
    url: DEFAULT_URL,
    key: DEFAULT_KEY
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, key }));
  // Force reload to re-init client
  window.location.reload();
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
};

// Initialize client with configuration
const { url, key } = getSupabaseConfig();

export const supabase = createClient(url, key);
