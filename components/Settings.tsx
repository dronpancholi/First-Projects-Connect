import React, { useState, useEffect } from 'react';
import { saveSupabaseConfig, getSupabaseConfig } from '../services/supabaseClient.ts';
import { Database, Check, AlertCircle, Copy, RefreshCw, Zap, ExternalLink, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';
import { GlassPanel, GlassCard, GlassButton, GlassInput, GlassBadge } from './ui/LiquidGlass.tsx';

const SQL_SCHEMA = `
-- First Projects Connect Database Schema
-- Run this in your Supabase SQL Editor to initialize or update your ecosystem.

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- 1. Projects & Tasks
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text,
  progress integer default 0,
  tags jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  project_id uuid references projects on delete cascade,
  title text not null,
  status text,
  priority text,
  due_date timestamptz
);

-- 2. Notes & Assets
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  project_id uuid references projects on delete cascade,
  title text not null,
  content text,
  updated_at timestamptz default now()
);

create table if not exists assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  project_id uuid references projects on delete cascade,
  name text not null,
  type text not null,
  url text not null,
  description text
);

-- 3. Whiteboards & Snippets
create table if not exists whiteboards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  elements jsonb default '[]',
  updated_at timestamptz default now()
);

create table if not exists snippets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  language text not null,
  code text,
  folder text,
  updated_at timestamptz default now()
);

-- Security Policies (RLS)
alter table projects enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table assets enable row level security;
alter table whiteboards enable row level security;
alter table snippets enable row level security;

-- Drop existing policies to avoid conflicts on re-run
drop policy if exists "Users can crud their own projects" on projects;
drop policy if exists "Users can crud their own tasks" on tasks;
drop policy if exists "Users can crud their own notes" on notes;
drop policy if exists "Users can crud their own assets" on assets;
drop policy if exists "Users can crud their own whiteboards" on whiteboards;
drop policy if exists "Users can crud their own snippets" on snippets;

create policy "Users can crud their own projects" on projects for all using (auth.uid() = user_id);
create policy "Users can crud their own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users can crud their own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can crud their own assets" on assets for all using (auth.uid() = user_id);
create policy "Users can crud their own whiteboards" on whiteboards for all using (auth.uid() = user_id);
create policy "Users can crud their own snippets" on snippets for all using (auth.uid() = user_id);
`;

const Settings: React.FC = () => {
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  const [openRouterKey, setOpenRouterKey] = useState(localStorage.getItem('openrouter_key') || '');
  const [copied, setCopied] = useState(false);

  // Removed old AI check logic since we use a simple key now

  const handleSaveOpenRouter = () => {
    localStorage.setItem('openrouter_key', openRouterKey);
    alert("AI Key Saved!");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) {
      saveSupabaseConfig(url, key);
    }
  };
  const copySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 text-purple-400 mb-3">
          <SettingsIcon size={18} />
          <span className="text-xs font-semibold uppercase tracking-widest">Configuration</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Settings</h1>
        <div className="flex items-center gap-2">
          <GlassBadge variant="primary">v1.3.1</GlassBadge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Connection Config */}
        <div className="space-y-6">
          <GlassPanel>
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Database size={20} className="text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Backend Connection</h2>
              </div>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                Synchronize your ecosystem with your Supabase cloud instance.
              </p>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Endpoint URL</label>
                  <GlassInput
                    type="text"
                    placeholder="https://xyz.supabase.co"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Service Key</label>
                  <GlassInput
                    type="password"
                    placeholder="eyJh..."
                    value={key}
                    onChange={e => setKey(e.target.value)}
                  />
                </div>
                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> Save Connection
                </GlassButton>
              </form>
            </div>
          </GlassPanel>

          <GlassPanel>
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={20} className="text-amber-400" />
                <h2 className="text-lg font-semibold text-white">AI Intelligence</h2>
              </div>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                Connect OpenRouter to enable free AI features (Generative UI, Plans, Code Analysis).
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">OpenRouter API Key</label>
                  <GlassInput
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={openRouterKey}
                    onChange={e => setOpenRouterKey(e.target.value)}
                  />
                </div>

                <GlassButton
                  onClick={handleSaveOpenRouter}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-500/30"
                >
                  <Check size={14} /> Save AI Key
                </GlassButton>

                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  className="flex items-center justify-between p-4 glass-card-subtle rounded-xl group transition-all hover:bg-white/10"
                >
                  <span className="text-sm font-medium text-white/60 group-hover:text-white">Get Free Key</span>
                  <ExternalLink size={14} className="text-white/40 group-hover:text-amber-400" />
                </a>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-6">
          <GlassCard className="border-blue-500/30 bg-blue-500/10">
            <div className="p-5 relative z-10">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-blue-400 font-semibold mb-1">Database Sync (v1.3.1)</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Schema update detected. Ensure your tables are correctly configured for multi-user isolation.
                    <br /><br />
                    1. Copy the SQL code below.<br />
                    2. Go to the <a href="https://supabase.com/dashboard" target="_blank" className="underline font-medium text-blue-400">Supabase SQL Editor</a>.<br />
                    3. Execute the script to synchronize logic layers.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassPanel>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 relative z-10">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">schema_v1.3.1.sql</span>
              <button
                onClick={copySQL}
                className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto h-80 text-white/60 bg-black/20 custom-scrollbar relative z-10">
              {SQL_SCHEMA}
            </pre>
          </GlassPanel>
        </div>

      </div>
    </div>
  );
};

export default Settings;
