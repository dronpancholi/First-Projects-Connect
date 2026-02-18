import React from 'react';
import { GlassPanel, GlassButton, GlassBadge } from '../ui/LiquidGlass.tsx';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Download, Share2, Filter, Award, Zap, Target } from 'lucide-react';

// Mock Data for Radar Chart
const skillData = [
    { subject: 'Consistency', A: 120, fullMark: 150 },
    { subject: 'Focus Quality', A: 98, fullMark: 150 },
    { subject: 'Task Velocity', A: 86, fullMark: 150 },
    { subject: 'Collaboration', A: 99, fullMark: 150 },
    { subject: 'Learning', A: 85, fullMark: 150 },
    { subject: 'Impact', A: 65, fullMark: 150 },
];

// Mock Data for Growth Timeline
const growthData = [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 70 },
    { month: 'Mar', score: 68 },
    { month: 'Apr', score: 75 },
    { month: 'May', score: 82 },
    { month: 'Jun', score: 90 },
];

const MemberPerformance: React.FC = () => {
    return (
        <div className="h-full flex flex-col space-y-6">
            <header className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Performance Profile</h1>
                    <p className="text-glass-secondary mt-1">Detailed analysis of individual contribution and growth.</p>
                </div>
                <div className="flex gap-3">
                    <GlassButton variant="secondary" className="gap-2"><Download size={16} /> Export</GlassButton>
                    <GlassButton variant="primary" className="gap-2"><Share2 size={16} /> Share Profile</GlassButton>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar p-1">
                {/* Profile Card */}
                <GlassPanel className="lg:col-span-1 flex flex-col items-center p-8 text-center">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                        <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Alex+Chen&background=random" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-glass-primary">Alex Chen</h2>
                    <p className="text-glass-secondary">Senior Developer</p>

                    <div className="flex gap-2 mt-4 mb-8">
                        <GlassBadge variant="purple">Level 42</GlassBadge>
                        <GlassBadge variant="success">Top 5%</GlassBadge>
                    </div>

                    <div className="w-full space-y-4 text-left">
                        <div className="p-4 bg-glass-subtle/30 rounded-xl border border-glass-border-subtle">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-glass-secondary">Focus Score</span>
                                <Zap size={16} className="text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold text-white">94/100</p>
                        </div>
                        <div className="p-4 bg-glass-subtle/30 rounded-xl border border-glass-border-subtle">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-glass-secondary">Tasks Completed</span>
                                <Target size={16} className="text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-white">142</p>
                        </div>
                    </div>
                </GlassPanel>

                {/* Charts Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Radar Chart */}
                    <GlassPanel className="h-[400px] flex flex-col">
                        <div className="p-4 border-b border-glass-border-subtle flex justify-between items-center">
                            <h3 className="font-semibold text-glass-primary">Skill Radar</h3>
                            <GlassButton variant="secondary" size="sm" className="gap-2"><Filter size={14} /> Compare</GlassButton>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Alex"
                                        dataKey="A"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="#8b5cf6"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassPanel>

                    {/* Growth Timeline */}
                    <GlassPanel className="h-[300px] flex flex-col">
                        <div className="p-4 border-b border-glass-border-subtle">
                            <h3 className="font-semibold text-glass-primary">Performance Growth</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthData}>
                                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default MemberPerformance;
