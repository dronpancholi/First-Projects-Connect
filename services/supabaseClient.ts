import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'nexus_supabase_config';

export const getSupabaseConfig = () => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) return JSON.parse(stored);
  return {
    url: '',
    key: ''
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, key }));
  // Force reload to re-init client
  window.location.reload();
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return url && key;
};

// Initialize client if configured
const { url, key } = getSupabaseConfig();

// Default to a dummy client if not configured so imports don't crash, 
// but the App will block access until configured.
export const supabase = url && key 
  ? createClient(url, key) 
  : createClient('https://placeholder.supabase.co', 'placeholder');
