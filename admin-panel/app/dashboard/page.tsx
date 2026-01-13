
'use client';

import { useState, useEffect } from 'react';
import { Church, Moon, Sun, Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({ templeCount: 0, poonamCount: 0, grahanCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-saffron" size={40} /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-saffron-dark">Dashboard</h1>
                <p className="text-brown">Welcome back to Daily Darshan Pearl Admin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-saffron/20 flex items-center gap-4">
                    <div className="p-4 bg-saffron/10 rounded-full text-saffron">
                        <Church size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-brown-light font-medium">Total Temples</p>
                        <p className="text-2xl font-bold text-brown-dark">{stats.templeCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-saffron/20 flex items-center gap-4">
                    <div className="p-4 bg-saffron/10 rounded-full text-saffron">
                        <Moon size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-brown-light font-medium">Upcoming Poonam</p>
                        <p className="text-2xl font-bold text-brown-dark">{stats.poonamCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-saffron/20 flex items-center gap-4">
                    <div className="p-4 bg-saffron/10 rounded-full text-saffron">
                        <Sun size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-brown-light font-medium">Upcoming Grahan</p>
                        <p className="text-2xl font-bold text-brown-dark">{stats.grahanCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-saffron/10 text-center">
                <span className="text-6xl block mb-4">🕉️</span>
                <h2 className="text-xl font-bold text-brown">May the day be blessed.</h2>
                <p className="text-brown-light mt-2">Manage your app content from the sidebar.</p>
            </div>
        </div>
    );
}
