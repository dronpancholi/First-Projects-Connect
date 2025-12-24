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
  const [copied, setCopied] = useState(false);
  const [isAiLinked, setIsAiLinked] = useState(false);

  useEffect(() => {
    const checkAi = async () => {
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const linked = await (window as any).aistudio.hasSelectedApiKey();
        setIsAiLinked(linked);
      }
    };
    checkAi();
  }, []);

  const handleLinkAi = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      setIsAiLinked(true);
    }
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
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-3 text-gray-600 mb-2">
          <SettingsIcon size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">Configuration</span>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Settings</h1>
      <div className="flex items-center gap-2 mb-8">
        <GlassBadge>v1.3.1</GlassBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Connection Config */}
        <div className="space-y-6">
          <GlassPanel>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database size={20} className="text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">Backend Connection</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Synchronize your ecosystem with your Supabase cloud instance.
              </p>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint URL</label>
                  <GlassInput
                    type="text"
                    placeholder="https://xyz.supabase.co"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Service Key</label>
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
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={20} className="text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">AI Integration</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Link your Gemini API account to enable AI features.
              </p>

              <div className="space-y-4">
                <GlassCard className={isAiLinked ? 'border-green-200' : 'border-amber-200'}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isAiLinked ? (
                        <ShieldCheck className="text-green-500" size={20} />
                      ) : (
                        <AlertCircle className="text-amber-500" size={20} />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isAiLinked ? 'AI Connected' : 'Not Connected'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isAiLinked ? 'Ready for operation' : 'Authorization required'}
                        </p>
                      </div>
                    </div>
                    <GlassButton onClick={handleLinkAi} size="sm">
                      {isAiLinked ? 'Refresh' : 'Link'}
                    </GlassButton>
                  </div>
                </GlassCard>

                <a
                  href="https://ai.google.dev/gemini-api/docs/billing"
                  target="_blank"
                  className="flex items-center justify-between p-4 glass-card-subtle rounded-xl group transition-all hover:bg-white/80"
                >
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Billing Documentation</span>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600" />
                </a>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-6">
          <GlassCard className="border-blue-200 bg-blue-50/30">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-blue-600 font-semibold mb-1">Database Sync (v1.3.1)</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Schema update detected. Ensure your tables are correctly configured for multi-user isolation.
                    <br /><br />
                    1. Copy the SQL code below.<br />
                    2. Go to the <a href="https://supabase.com/dashboard" target="_blank" className="underline font-medium text-blue-600">Supabase SQL Editor</a>.<br />
                    3. Execute the script to synchronize logic layers.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassPanel>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100/50">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">schema_v1.3.1.sql</span>
              <button
                onClick={copySQL}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto h-80 text-gray-600 bg-gray-50/50 custom-scrollbar">
              {SQL_SCHEMA}
            </pre>
          </GlassPanel>
        </div>

      </div>
    </div>
  );
};

export default Settings;
