
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import { 
  CreditCard, TrendingUp, TrendingDown, DollarSign, 
  PieChart as PieIcon, Plus, Calendar, ArrowUpRight, 
  Database, Briefcase, ChevronRight, ArrowDownLeft, ArrowUpRight as ArrowUp
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const FinancialOps: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects } = useStore();
  const [activeFilter, setActiveFilter] = useState('ALL');

  const budgetData = [
    { name: 'Research', value: 2400 },
    { name: 'Cloud Ops', value: 1200 },
    { name: 'Licenses', value: 800 },
    { name: 'Marketing', value: 3500 },
    { name: 'Legal', value: 1500 },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <CreditCard size={14} />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">FinOps Module v1.2</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tighter leading-none mb-2">Financial Ledger</h1>
          <p className="text-gray-500 text-sm font-medium">Manage project capital, revenue cycles, and operational expenditure.</p>
        </div>
        
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
        >
           <Plus size={16} /> Log Entry
        </button>
      </header>

      {/* FinOps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card-professional p-8 bg-gray-900 text-white">
           <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 mb-6 flex items-center gap-2">
              <TrendingUp size={14} /> Net Capital
           </p>
           <h3 className="text-4xl font-display font-bold tracking-tighter mb-2">$84,250.00</h3>
           <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <ArrowUp size={12} /> +4.2% Growth
           </div>
        </div>
        <div className="card-professional p-8">
           <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
              <TrendingDown size={14} /> Burn Rate (Monthly)
           </p>
           <h3 className="text-4xl font-display font-bold tracking-tighter mb-2 text-gray-900">$12,400.00</h3>
           <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">
              Within Safe Limit
           </div>
        </div>
        <div className="card-professional p-8">
           <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
              <Database size={14} /> Total ROI
           </p>
           <h3 className="text-4xl font-display font-bold tracking-tighter mb-2 text-gray-900">312%</h3>
           <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
              LTM Analytics
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Budget Allocation */}
        <div className="lg:col-span-7">
           <section className="card-professional p-8">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Resource Allocation Chart</h2>
              </div>
              <div className="h-72 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} dy={10} />
                       <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px'}} />
                       <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {budgetData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 3 ? '#4F46E5' : '#E5E7EB'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </section>
        </div>

        {/* Recent Operations */}
        <div className="lg:col-span-5">
           <section className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm h-full flex flex-col">
              <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Transaction History</h2>
              </div>
              <div className="flex-1 overflow-auto divide-y divide-gray-50">
                 {[
                   { name: 'Supabase Cloud', type: 'Expense', amount: -25.00, icon: <TrendingDown size={14} className="text-rose-500" /> },
                   { name: 'Stripe Payout', type: 'Revenue', amount: +2400.00, icon: <TrendingUp size={14} className="text-emerald-500" /> },
                   { name: 'OpenAI API', type: 'Expense', amount: -42.50, icon: <TrendingDown size={14} className="text-rose-500" /> },
                   { name: 'Apple Dev', type: 'Expense', amount: -99.00, icon: <TrendingDown size={14} className="text-rose-500" /> },
                   { name: 'Client A Project', type: 'Revenue', amount: +5000.00, icon: <TrendingUp size={14} className="text-emerald-500" /> },
                 ].map((t, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-all cursor-default group">
                       <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                          {t.icon}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-bold text-gray-900 truncate tracking-tight">{t.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t.type}</p>
                       </div>
                       <div className={`text-[14px] font-bold ${t.amount < 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                          {t.amount < 0 ? `- $${Math.abs(t.amount).toFixed(2)}` : `+ $${t.amount.toFixed(2)}`}
                       </div>
                    </div>
                 ))}
              </div>
           </section>
        </div>

      </div>
    </div>
  );
};

export default FinancialOps;
