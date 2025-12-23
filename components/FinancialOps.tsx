
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import { 
  CreditCard, TrendingUp, TrendingDown, DollarSign, 
  Plus, Calendar, ArrowUpRight, Database, 
  ChevronRight, ArrowDownLeft, Trash2, X, Wallet
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

const FinancialOps: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
  const { projects, financials, addFinancial, deleteFinancial } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'revenue' | 'expense'>('expense');
  const [projectId, setProjectId] = useState('');

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc || !projectId) return;
    await addFinancial({
      projectId,
      amount: parseFloat(amount),
      type,
      description: desc,
      date: new Date()
    });
    setAmount('');
    setDesc('');
    setShowModal(false);
  };

  const totalRevenue = financials.filter(f => f.type === 'revenue').reduce((acc, f) => acc + f.amount, 0);
  const totalExpense = financials.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0);
  const netCapital = totalRevenue - totalExpense;

  const chartData = financials.slice(-5).map(f => ({ name: f.description.slice(0, 8), value: f.amount }));

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-12">
        <div>
          <div className="flex items-center gap-3 text-yellow-600 mb-3">
             <CreditCard size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Cap-Ex Ledger Active</span>
          </div>
          <h1 className="text-5xl font-display font-black text-gray-900 tracking-tighter leading-none mb-3">Financial Nexus</h1>
          <p className="text-gray-500 text-sm font-medium">Strategic asset management and capital throughput analysis.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-yellow-100/20"
        >
           <Plus size={18} className="text-yellow-400" /> Register Operation
        </button>
      </header>

      {/* Industrial Ledger Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="card-professional p-10 bg-gray-900 text-white rounded-[2.5rem] border-none shadow-2xl">
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-10 flex items-center gap-3">
              <TrendingUp size={16} /> Ecosystem liquidity
           </p>
           <h3 className="text-5xl font-display font-black tracking-tighter mb-4">${netCapital.toLocaleString()}</h3>
           <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10">
              Uptime verified
           </div>
        </div>
        <div className="card-professional p-10 rounded-[2.5rem] bg-gray-50/50 border-gray-100">
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-3">
              <TrendingDown size={16} /> Burn Intensity
           </p>
           <h3 className="text-5xl font-display font-black tracking-tighter mb-4 text-gray-900">${totalExpense.toLocaleString()}</h3>
           <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
              LTM Operational Outflow
           </div>
        </div>
        <div className="card-professional p-10 rounded-[2.5rem] bg-gray-50/50 border-gray-100">
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-3">
              <Database size={16} /> Total Revenue
           </p>
           <h3 className="text-5xl font-display font-black tracking-tighter mb-4 text-gray-900">${totalRevenue.toLocaleString()}</h3>
           <div className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">
              Gross Inbound Synthesis
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Resource Distribution Chart */}
        <div className="lg:col-span-7">
           <section className="card-professional p-10 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Tactical Outflow Visualization</h2>
              </div>
              <div className="h-80 w-full">
                 {financials.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                       <Wallet size={48} />
                    </div>
                 ) : (
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={chartData}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: '900'}} dy={10} />
                          <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '16px', border: 'none', background: '#111827', color: '#fff'}} />
                          <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                             {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#EAB308' : '#111827'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 )}
              </div>
           </section>
        </div>

        {/* Realtime Ledger Registry */}
        <div className="lg:col-span-5">
           <section className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm h-full flex flex-col">
              <div className="px-8 py-6 bg-gray-900 border-b border-gray-800">
                 <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-yellow-500">Transaction Registry</h2>
              </div>
              <div className="flex-1 overflow-auto divide-y divide-gray-50 custom-scrollbar">
                 {financials.length === 0 && (
                    <div className="p-20 text-center text-[10px] font-black uppercase text-gray-300 tracking-[0.4em]">Zero data points logged</div>
                 )}
                 {financials.map((t) => (
                    <div key={t.id} className="flex items-center gap-6 p-6 hover:bg-yellow-50/20 transition-all group">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${t.type === 'revenue' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
                          {t.type === 'revenue' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-black text-gray-900 truncate tracking-tight mb-1">{t.description}</h4>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.type}</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className={`text-[16px] font-black ${t.type === 'expense' ? 'text-gray-900' : 'text-emerald-600'}`}>
                             {t.type === 'expense' ? `- $${t.amount}` : `+ $${t.amount}`}
                          </div>
                          <button onClick={() => deleteFinancial(t.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-rose-500 transition-all">
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </section>
        </div>

      </div>

      {/* Operational Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl border border-white/20 overflow-hidden">
              <form onSubmit={handleLog}>
                <div className="p-12 bg-gray-900 text-white flex justify-between items-center">
                   <div>
                     <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">Log Operation</h3>
                     <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Financial entry authorization</p>
                   </div>
                   <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={32}/></button>
                </div>
                <div className="p-12 space-y-8">
                   <div className="flex bg-gray-100 rounded-2xl p-1">
                      <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Outbound</button>
                      <button type="button" onClick={() => setType('revenue')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${type === 'revenue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Inbound</button>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Amount (USD)</label>
                        <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-xl font-black" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Workspace Node</label>
                        <select className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-xs font-black uppercase" value={projectId} onChange={e => setProjectId(e.target.value)}>
                           <option value="">Select node</option>
                           {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                      <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none text-sm font-bold" type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Operation purpose..." />
                   </div>
                </div>
                <div className="p-12 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-6">
                   <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 font-black uppercase text-xs">Abort</button>
                   <button type="submit" className="px-12 py-4 bg-gray-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition-all">Execute</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default FinancialOps;
