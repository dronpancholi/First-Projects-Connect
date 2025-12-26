import React, { useState } from 'react';
import { CreditCard, Plus, X, TrendingUp, TrendingDown, DollarSign, Receipt, PieChart } from 'lucide-react';
import { GlassPanel, GlassCard, GlassModal, GlassButton, GlassInput, GlassSelect, GlassBadge } from './ui/LiquidGlass.tsx';
import { ViewState } from '../types.ts';

interface Transaction {
   id: string;
   description: string;
   amount: number;
   type: 'income' | 'expense';
   category: string;
   date: string;
}

const FinancialOps: React.FC<{ setView: (view: ViewState) => void }> = ({ setView }) => {
   const [transactions, setTransactions] = useState<Transaction[]>([
      { id: '1', description: 'Client Payment', amount: 5000, type: 'income', category: 'Revenue', date: '2024-01-15' },
      { id: '2', description: 'Software License', amount: 299, type: 'expense', category: 'Tools', date: '2024-01-14' },
      { id: '3', description: 'Freelance Work', amount: 1200, type: 'income', category: 'Revenue', date: '2024-01-12' },
   ]);

   const [showModal, setShowModal] = useState(false);
   const [newTransaction, setNewTransaction] = useState<{
      description: string;
      amount: string;
      type: 'income' | 'expense';
      category: string;
   }>({
      description: '', amount: '', type: 'income', category: ''
   });

   const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
   const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
   const balance = totalIncome - totalExpenses;

   const handleAddTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTransaction.description || !newTransaction.amount) return;
      setTransactions([
         {
            id: Date.now().toString(),
            ...newTransaction,
            amount: parseFloat(newTransaction.amount),
            date: new Date().toISOString().split('T')[0]
         },
         ...transactions
      ]);
      setNewTransaction({ description: '', amount: '', type: 'income', category: '' });
      setShowModal(false);
   };

   return (
      <div className="space-y-8 animate-fade-in pb-20">
         {/* Header */}
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 text-green-600 mb-3">
                  <CreditCard size={18} />
                  <span className="text-xs font-semibold uppercase tracking-widest">Finance Hub</span>
               </div>
               <h1 className="text-4xl font-bold text-glass-primary tracking-tight mb-2">Financials</h1>
               <p className="text-glass-secondary text-sm">Track income, expenses, and cash flow.</p>
            </div>

            <GlassButton variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
               <Plus size={18} /> Add Transaction
            </GlassButton>
         </header>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="bg-gradient-to-br from-green-500/20 to-emerald-500/20">
               <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                     <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center"
                        style={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)' }}>
                        <TrendingUp size={22} className="text-green-500" />
                     </div>
                     <GlassBadge variant="success">Income</GlassBadge>
                  </div>
                  <p className="text-4xl font-bold text-glass-primary mb-1">${totalIncome.toLocaleString()}</p>
                  <p className="text-sm text-glass-secondary">Total Income</p>
               </div>
            </GlassCard>

            <GlassCard className="bg-gradient-to-br from-red-500/20 to-rose-500/20">
               <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                     <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center"
                        style={{ boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)' }}>
                        <TrendingDown size={22} className="text-red-500" />
                     </div>
                     <GlassBadge variant="danger">Expenses</GlassBadge>
                  </div>
                  <p className="text-4xl font-bold text-glass-primary mb-1">${totalExpenses.toLocaleString()}</p>
                  <p className="text-sm text-glass-secondary">Total Expenses</p>
               </div>
            </GlassCard>

            <GlassCard className="bg-gradient-to-br from-purple-500/20 to-blue-500/20">
               <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                     <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center"
                        style={{ boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)' }}>
                        <DollarSign size={22} className="text-purple-500" />
                     </div>
                     <GlassBadge variant={balance >= 0 ? 'success' : 'danger'}>
                        {balance >= 0 ? 'Positive' : 'Negative'}
                     </GlassBadge>
                  </div>
                  <p className="text-4xl font-bold text-glass-primary mb-1">${balance.toLocaleString()}</p>
                  <p className="text-sm text-glass-secondary">Net Balance</p>
               </div>
            </GlassCard>
         </div>

         {/* Transactions */}
         <GlassPanel>
            <div className="p-6 border-b border-glass-border-subtle flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Receipt size={20} className="text-glass-secondary" />
                  <h2 className="text-lg font-semibold text-glass-primary">Transaction Registry</h2>
               </div>
               <span className="glass-badge">{transactions.length} entries</span>
            </div>
            <div className="divide-y divide-glass-border-subtle">
               {transactions.map(transaction => (
                  <div key={transaction.id} className="p-5 flex items-center gap-4 hover:bg-glass-subtle transition-colors">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.type === 'income'
                        ? 'glass-card bg-green-500/20'
                        : 'glass-card bg-red-500/20'
                        }`}>
                        {transaction.type === 'income'
                           ? <TrendingUp size={18} className="text-green-500" />
                           : <TrendingDown size={18} className="text-red-500" />
                        }
                     </div>
                     <div className="flex-1">
                        <p className="font-medium text-glass-primary">{transaction.description}</p>
                        <p className="text-xs text-glass-secondary">{transaction.category} • {transaction.date}</p>
                     </div>
                     <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                     </p>
                  </div>
               ))}
            </div>
         </GlassPanel>

         {/* Add Transaction Modal */}
         {showModal && (
            <GlassModal onClose={() => setShowModal(false)}>
               <form onSubmit={handleAddTransaction}>
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-2xl font-bold text-glass-primary">Add Transaction</h3>
                           <p className="text-sm text-glass-secondary mt-1">Record a new financial entry</p>
                        </div>
                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="p-2 text-glass-muted hover:text-glass-primary transition-colors"
                        >
                           <X size={24} />
                        </button>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Type</label>
                           <div className="flex gap-3">
                              {['income', 'expense'].map(type => (
                                 <button
                                    key={type}
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: type as 'income' | 'expense' })}
                                    className={`flex-1 p-4 glass-card rounded-xl text-center font-medium capitalize transition-all ${newTransaction.type === type
                                       ? 'border-purple-500/50 bg-purple-500/20 text-glass-primary'
                                       : 'border-glass-border-subtle text-glass-muted'
                                       }`}
                                 >
                                    {type}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Description</label>
                           <GlassInput
                              value={newTransaction.description}
                              onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                              placeholder="What was this transaction for?"
                              autoFocus
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Amount</label>
                           <GlassInput
                              type="number"
                              value={newTransaction.amount}
                              onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                              placeholder="0.00"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-glass-secondary uppercase tracking-wider">Category</label>
                           <GlassInput
                              value={newTransaction.category}
                              onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                              placeholder="e.g. Revenue, Tools, Subscriptions"
                           />
                        </div>
                     </div>

                     <div className="mt-8 flex justify-end gap-3">
                        <GlassButton type="button" onClick={() => setShowModal(false)}>
                           Cancel
                        </GlassButton>
                        <GlassButton type="submit" variant="primary">
                           Add Transaction
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
