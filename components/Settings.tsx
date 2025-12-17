
import React, { useState } from 'react';
import { saveSupabaseConfig, getSupabaseConfig } from '../services/supabaseClient.ts';
import { Database, Check, AlertCircle, Copy, RefreshCw } from 'lucide-react';

const SQL_SCHEMA = `
-- First Projects Connect v1.2.3 Database Schema (Full / Repair)
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

-- 3. Code Studio & Whiteboards
create table if not exists snippets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  language text not null,
  code text,
  folder text,
  updated_at timestamptz default now()
);

create table if not exists whiteboards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  elements jsonb default '[]',
  updated_at timestamptz default now()
);

-- Security Policies (RLS)
alter table projects enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table assets enable row level security;
alter table snippets enable row level security;
alter table whiteboards enable row level security;

-- Drop existing policies to avoid conflicts on re-run
drop policy if exists "Users can crud their own projects" on projects;
drop policy if exists "Users can crud their own tasks" on tasks;
drop policy if exists "Users can crud their own notes" on notes;
drop policy if exists "Users can crud their own assets" on assets;
drop policy if exists "Users can crud their own snippets" on snippets;
drop policy if exists "Users can crud their own whiteboards" on whiteboards;

create policy "Users can crud their own projects" on projects for all using (auth.uid() = user_id);
create policy "Users can crud their own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users can crud their own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can crud their own assets" on assets for all using (auth.uid() = user_id);
create policy "Users can crud their own snippets" on snippets for all using (auth.uid() = user_id);
create policy "Users can crud their own whiteboards" on whiteboards for all using (auth.uid() = user_id);
`;

const Settings: React.FC = () => {
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  const [copied, setCopied] = useState(false);

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
        <h1 className="text-3xl font-bold text-apple-text tracking-tight">System Settings</h1>
        <div className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-500">v1.2.3</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Connection Config */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 text-gray-900">
            <Database size={20} />
            <h2 className="text-lg font-bold">Backend Connection</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Connect First Projects Connect to your Supabase instance.
          </p>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Supabase URL</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none text-sm font-mono transition-all"
                placeholder="https://xyz.supabase.co"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Anon Key</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none text-sm font-mono transition-all"
                placeholder="eyJh..."
                value={key}
                onChange={e => setKey(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-black text-white font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Save & Reboot System
            </button>
          </form>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-blue-900 font-semibold mb-1">Database Update Required (v1.2.3)</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  The latest update ensures deletion reliability and supports AI-generated mind maps.
                  <br/><br/>
                  1. Copy the SQL code below.<br/>
                  2. Go to the <a href="https://supabase.com/dashboard" target="_blank" className="underline font-bold">Supabase SQL Editor</a>.<br/>
                  3. Paste and run the code.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-gray-300 rounded-2xl overflow-hidden border border-gray-800">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-xs font-mono text-gray-400">schema_v1.2.3.sql</span>
              <button onClick={copySQL} className="text-xs flex items-center gap-1 hover:text-white transition-colors">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy SQL'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto h-64 text-blue-200">
              {SQL_SCHEMA}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
