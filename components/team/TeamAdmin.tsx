import React, { useState } from 'react';
import { GlassPanel, GlassButton, GlassInput, GlassSelect, GlassBadge } from '../ui/LiquidGlass.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserPlus, Trash2, Shield, Search, MoreVertical, Mail } from 'lucide-react';

const TeamAdmin: React.FC = () => {
    const { user } = useAuth();
    // Use mock members for now as StoreContext doesn't have full member list with roles exposed cleanly yet
    // In real implementation, this would come from useStore().members
    const [members, setMembers] = useState([
        { id: '1', name: 'Alex Chen', email: 'alex@example.com', role: 'member', status: 'active', avatar: '' },
        { id: '2', name: 'Sarah Jones', email: 'sarah@example.com', role: 'admin', status: 'active', avatar: '' },
        { id: '3', name: 'Mike Ross', email: 'mike@example.com', role: 'viewer', status: 'pending', avatar: '' },
    ]);

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        // Mock invite logic
        console.log(`Inviting ${inviteEmail} as ${inviteRole}`);
        setMembers([...members, {
            id: Date.now().toString(),
            name: 'Invited User',
            email: inviteEmail,
            role: inviteRole,
            status: 'pending',
            avatar: ''
        }]);
        setInviteEmail('');
    };

    const handleRemoveMember = (id: string) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const handleRoleChange = (id: string, newRole: string) => {
        setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <header className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Team Administration</h1>
                    <p className="text-glass-secondary mt-1">Manage members, roles, and permissions.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar p-1">
                {/* Invite Section */}
                <GlassPanel className="lg:col-span-1 h-fit">
                    <div className="p-4 border-b border-glass-border-subtle">
                        <h3 className="font-semibold text-glass-primary flex items-center gap-2">
                            <UserPlus size={18} className="text-blue-400" /> Invite New Member
                        </h3>
                    </div>
                    <form onSubmit={handleInvite} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-glass-secondary mb-1.5">Email Address</label>
                            <GlassInput
                                type="email"
                                placeholder="colleague@company.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-glass-secondary mb-1.5">Role</label>
                            <GlassSelect value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                            </GlassSelect>
                        </div>
                        <GlassButton type="submit" variant="primary" className="w-full justify-center">
                            Send Invitation
                        </GlassButton>
                    </form>
                </GlassPanel>

                {/* Member List */}
                <GlassPanel className="lg:col-span-2 flex flex-col min-h-[500px]">
                    <div className="p-4 border-b border-glass-border-subtle flex justify-between items-center">
                        <h3 className="font-semibold text-glass-primary">Team Members ({members.length})</h3>
                        <div className="relative w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-secondary" />
                            <GlassInput placeholder="Search members..." className="pl-9 py-2 text-sm" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-glass-border-subtle text-xs text-glass-secondary uppercase tracking-wider">
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-glass-border-subtle">
                                {members.map(member => (
                                    <tr key={member.id} className="group hover:bg-glass-subtle/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-glass-border flex items-center justify-center text-xs font-bold text-glass-primary">
                                                    {member.avatar ? <img src={member.avatar} alt="" className="rounded-full" /> : member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-glass-primary">{member.name}</p>
                                                    <p className="text-xs text-glass-secondary">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                className="bg-transparent border-none text-glass-primary focus:ring-0 cursor-pointer hover:text-blue-400 transition-colors"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <GlassBadge variant={member.status === 'active' ? 'success' : 'warning'}>
                                                {member.status}
                                            </GlassBadge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 text-glass-secondary hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                                                title="Remove User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
};

export default TeamAdmin;
