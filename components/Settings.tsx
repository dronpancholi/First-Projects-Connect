
import React, { useState, useEffect } from 'react';
import { saveSupabaseConfig, getSupabaseConfig } from '../services/supabaseClient.ts';
import { Database, Check, AlertCircle, Copy, RefreshCw, Zap, ExternalLink, Link2, ShieldCheck } from 'lucide-react';

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
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <div className="px-2 py-1 bg-zinc-900 rounded text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-800">v1.3.1</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Connection Config */}
        <div className="space-y-8">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-white">
              <Database size={20} className="text-zinc-400" />
              <h2 className="text-lg font-bold">Backend Connection</h2>
            </div>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Synchronize your personal ecosystem with your Supabase cloud instance.
            </p>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Endpoint URL</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-primary outline-none text-sm font-mono transition-all text-zinc-200"
                  placeholder="https://xyz.supabase.co"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Service Key</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-primary outline-none text-sm font-mono transition-all text-zinc-200"
                  placeholder="eyJh..."
                  value={key}
                  onChange={e => setKey(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-zinc-100 text-zinc-900 font-bold py-2.5 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20"
              >
                <RefreshCw size={14} /> Update Persistence
              </button>
            </form>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-white">
              <Zap size={20} className="text-brand-primary" />
              <h2 className="text-lg font-bold">AI Uplink</h2>
            </div>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Link your Gemini API account to enable agentic vision and native audio reasoning.
            </p>
            
            <div className="space-y-4">
               <div className={`p-4 rounded-xl border flex items-center justify-between ${isAiLinked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                  <div className="flex items-center gap-3">
                    {isAiLinked ? <ShieldCheck className="text-emerald-500" size={20} /> : <AlertCircle className="text-amber-500" size={20} />}
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{isAiLinked ? 'AI Bridge Active' : 'Bridge Restricted'}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{isAiLinked ? 'Ready for operation' : 'Key authorization required'}</p>
                    </div>
                  </div>
                  <button onClick={handleLinkAi} className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black text-white uppercase tracking-widest rounded-lg border border-zinc-700">
                    {isAiLinked ? 'Refresh' : 'Link'}
                  </button>
               </div>

               <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                className="flex items-center justify-between p-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl group transition-all hover:border-zinc-700"
               >
                 <span className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-200">Billing Documentation</span>
                 <ExternalLink size={12} className="text-zinc-600 group-hover:text-brand-primary" />
               </a>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-6">
          <div className="bg-brand-primary/10 p-6 rounded-2xl border border-brand-primary/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-brand-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-brand-primary font-bold mb-1">Database Sync (v1.3.1)</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  System optimized: Schema update detected. Ensure your tables are correctly configured for multi-user isolation.
                  <br/><br/>
                  1. Copy the SQL code below.<br/>
                  2. Go to the <a href="https://supabase.com/dashboard" target="_blank" className="underline font-bold text-white">Supabase SQL Editor</a>.<br/>
                  3. Execute the script to synchronize logic layers.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 text-zinc-400 rounded-2xl overflow-hidden border border-zinc-900">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">schema_v1.3.1.sql</span>
              <button onClick={copySQL} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-colors">
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 text-[10px] font-mono overflow-x-auto h-80 text-brand-primary/80 custom-scrollbar">
              {SQL_SCHEMA}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
