import React from 'react';
import { GlassPanel } from '../ui/LiquidGlass.tsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', hours: 4, consistency: 75 },
    { name: 'Tue', hours: 6.5, consistency: 82 },
    { name: 'Wed', hours: 5, consistency: 78 },
    { name: 'Thu', hours: 8, consistency: 88 },
    { name: 'Fri', hours: 7.2, consistency: 92 },
    { name: 'Sat', hours: 3, consistency: 85 },
    { name: 'Sun', hours: 4.5, consistency: 80 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/80 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-xl text-xs">
                <p className="font-semibold text-white mb-1">{label}</p>
                <p className="text-blue-300">
                    Deep Work: <span className="text-white font-medium">{payload[0].value}h</span>
                </p>
                <p className="text-purple-300">
                    Consistency: <span className="text-white font-medium">{payload[1].value}%</span>
                </p>
            </div>
        );
    }
    return null;
};

const TeamProductivityChart: React.FC = () => {
    return (
        <GlassPanel className="h-full min-h-[300px] flex flex-col">
            <div className="p-4 border-b border-glass-border-subtle">
                <h3 className="font-semibold text-glass-primary">Productivity Trend</h3>
            </div>
            <div className="p-4 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} />
                        <Area
                            type="monotone"
                            dataKey="hours"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorHours)"
                        />
                        <Area
                            type="monotone"
                            dataKey="consistency"
                            stroke="#c084fc"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorConsistency)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassPanel>
    );
};

export default TeamProductivityChart;
