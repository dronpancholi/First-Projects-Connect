import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ViewState } from '../types.ts';
import {
   CreditCard, TrendingUp, TrendingDown,
   Plus, X, Trash2, Wallet
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { GlassPanel, GlassCard, GlassModal, GlassButton, GlassInput, GlassSelect } from './ui/LiquidGlass.tsx';

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

   const chartData = financials.slice(-7).map(f => ({
      name: f.description.slice(0, 8),
      value: f.amount,
      type: f.type
   }));

   return (
      <div className="space-y-8 animate-fade-in pb-20">
         {/* Header */}
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 text-amber-600 mb-2">
                  <CreditCard size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Financial Dashboard</span>
               </div>
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Operations</h1>
               <p className="text-gray-500 text-sm mt-1">Track revenue and expenses across projects.</p>
            </div>

            <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
               <Plus size={16} /> Log Transaction
            </GlassButton>
         </header>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Net Capital */}
            <GlassCard className="bg-gradient-to-br from-gray-800 to-gray-900">
               <div className="p-6 text-white">
                  <div className="flex items-center gap-2 text-emerald-400 mb-4">
                     <TrendingUp size={16} />
                     <span className="text-xs font-semibold uppercase tracking-wider">Net Capital</span>
                  </div>
                  <h3 className="text-4xl font-bold tracking-tight mb-2">${netCapital.toLocaleString()}</h3>
                  <span className="text-xs font-medium text-emerald-400/80 bg-emerald-400/10 px-2 py-1 rounded">
                     Active Balance
                  </span>
               </div>
            </GlassCard>

            {/* Expenses */}
            <GlassCard>
               <div className="p-6">
                  <div className="flex items-center gap-2 text-red-500 mb-4">
                     <TrendingDown size={16} />
                     <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Expenses</span>
                  </div>
                  <h3 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">${totalExpense.toLocaleString()}</h3>
                  <span className="text-xs font-medium text-red-500">Outbound</span>
               </div>
            </GlassCard>

            {/* Revenue */}
            <GlassCard>
               <div className="p-6">
                  <div className="flex items-center gap-2 text-amber-500 mb-4">
                     <TrendingUp size={16} />
                     <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Revenue</span>
                  </div>
                  <h3 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">${totalRevenue.toLocaleString()}</h3>
                  <span className="text-xs font-medium text-amber-600">Inbound</span>
               </div>
            </GlassCard>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart */}
            <div className="lg:col-span-7">
               <GlassPanel>
                  <div className="p-6">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-semibold text-gray-900">Transaction Overview</h2>
                     </div>
                     <div className="h-72 w-full">
                        {financials.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-gray-300">
                              <Wallet size={48} className="mb-4" />
                              <p className="text-sm">No transactions yet</p>
                           </div>
                        ) : (
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData}>
                                 <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                 />
                                 <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{
                                       borderRadius: '12px',
                                       border: 'none',
                                       background: 'rgba(255,255,255,0.95)',
                                       backdropFilter: 'blur(8px)',
                                       boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                    }}
                                 />
                                 <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                       <Cell
                                          key={`cell-${index}`}
                                          fill={entry.type === 'revenue' ? '#34c759' : '#5856d6'}
                                       />
                                    ))}
                                 </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        )}
                     </div>
                  </div>
               </GlassPanel>
            </div>

            {/* Transaction List */}
            <div className="lg:col-span-5">
               <GlassPanel className="h-full">
                  <div className="flex flex-col h-full">
                     <div className="px-5 py-4 border-b border-gray-100/50">
                        <h2 className="text-sm font-semibold text-gray-900">Recent Transactions</h2>
                     </div>
                     <div className="flex-1 overflow-auto custom-scrollbar divide-y divide-gray-50">
                        {financials.length === 0 && (
                           <div className="p-12 text-center text-gray-400 text-sm">
                              No transactions logged
                           </div>
                        )}
                        {financials.slice().reverse().map((t) => (
                           <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-white/50 transition-colors group">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'revenue'
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-purple-50 text-purple-600'
                                 }`}>
                                 {t.type === 'revenue' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-sm font-medium text-gray-900 truncate">{t.description}</h4>
                                 <p className="text-xs text-gray-400 capitalize">{t.type}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className={`text-sm font-semibold ${t.type === 'expense' ? 'text-gray-900' : 'text-green-600'
                                    }`}>
                                    {t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString()}
                                 </span>
                                 <button
                                    onClick={() => deleteFinancial(t.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </GlassPanel>
            </div>
         </div>

         {/* Add Transaction Modal */}
         {showModal && (
            <GlassModal onClose={() => setShowModal(false)}>
               <form onSubmit={handleLog}>
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-bold text-gray-900">Log Transaction</h3>
                           <p className="text-sm text-gray-500 mt-1">Record a new financial entry</p>
                        </div>
                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                           <X size={24} />
                        </button>
                     </div>

                     <div className="space-y-6">
                        {/* Type Toggle */}
                        <div className="flex bg-gray-100/80 rounded-xl p-1">
                           <button
                              type="button"
                              onClick={() => setType('expense')}
                              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                                 }`}
                           >
                              Expense
                           </button>
                           <button
                              type="button"
                              onClick={() => setType('revenue')}
                              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${type === 'revenue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                                 }`}
                           >
                              Revenue
                           </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (USD)</label>
                              <GlassInput
                                 type="number"
                                 value={amount}
                                 onChange={e => setAmount(e.target.value)}
                                 placeholder="0.00"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Project</label>
                              <GlassSelect value={projectId} onChange={e => setProjectId(e.target.value)}>
                                 <option value="">Select project</option>
                                 {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                              </GlassSelect>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                           <GlassInput
                              type="text"
                              value={desc}
                              onChange={e => setDesc(e.target.value)}
                              placeholder="Transaction description..."
                           />
                        </div>
                     </div>

                     <div className="mt-8 flex justify-end gap-3">
                        <GlassButton type="button" onClick={() => setShowModal(false)}>
                           Cancel
                        </GlassButton>
                        <GlassButton type="submit" variant="primary">
                           Log Transaction
                        </GlassButton>
                     </div>
                  </div>
               </form>
            </GlassModal>
         )}
      </div>
   );
};

export default FinancialOps;
