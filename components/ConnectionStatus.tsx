
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [latency, setLatency] = useState<number | null>(null);

    const checkConnection = async () => {
        setStatus('checking');
        const start = performance.now();
        try {
            // Simple lightweight query to check connection
            const { error } = await supabase.from('projects').select('id').limit(1);
            if (error) throw error;

            const end = performance.now();
            setLatency(Math.round(end - start));
            setStatus('connected');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    if (status === 'checking') {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100/50 px-2 py-1 rounded">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Connecting...</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 cursor-pointer" onClick={checkConnection}>
                <XCircle className="w-3 h-3" />
                <span>Offline</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>Connected ({latency}ms)</span>
        </div>
    );
};
