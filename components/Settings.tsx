import React, { useState } from 'react';
import { saveSupabaseConfig, getSupabaseConfig } from '../services/supabaseClient';
import { Database, Check, AlertCircle, Copy } from 'lucide-react';

const SQL_SCHEMA = `
-- Run this in your Supabase SQL Editor

create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text,
  progress integer default 0,
  tags jsonb default '[]',
  created_at timestamptz default now()
);

create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  project_id uuid references projects on delete cascade,
  title text not null,
  status text,
  priority text,
  due_date timestamptz
);

create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  project_id uuid references projects on delete set null,
  title text not null,
  content text,
  updated_at timestamptz default now()
);

create table assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  project_id uuid references projects on delete cascade,
  name text not null,
  type text not null,
  url text not null,
  description text
);

-- Security Policies
alter table projects enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table assets enable row level security;

create policy "Users can crud their own projects" on projects for all using (auth.uid() = user_id);
create policy "Users can crud their own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users can crud their own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can crud their own assets" on assets for all using (auth.uid() = user_id);
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-apple-text tracking-tight mb-8">System Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Connection Config */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 text-gray-900">
            <Database size={20} />
            <h2 className="text-lg font-bold">Backend Connection</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Connect Nexus to your own Supabase instance. Data is owned by you and stored securely in your database.
          </p>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Supabase URL</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none text-sm font-mono"
                placeholder="https://xyz.supabase.co"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Anon Key</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none text-sm font-mono"
                placeholder="eyJh..."
                value={key}
                onChange={e => setKey(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-black text-white font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Save & Connect
            </button>
          </form>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-blue-900 font-semibold mb-1">First Time Setup?</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  1. Create a free project at <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a>.<br/>
                  2. Copy the Project URL and Anon Key to the form on the left.<br/>
                  3. Go to the SQL Editor in Supabase and run the schema below to set up your tables.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-gray-300 rounded-2xl overflow-hidden border border-gray-800">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-xs font-mono">schema.sql</span>
              <button onClick={copySQL} className="text-xs flex items-center gap-1 hover:text-white transition-colors">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto h-64">
              {SQL_SCHEMA}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
