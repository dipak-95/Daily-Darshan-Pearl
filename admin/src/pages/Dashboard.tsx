import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/config';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckCircle2, Clock, Upload, Sun, Moon, ArrowRight } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ temples: 0, poonam: 0, grahan: 0 });
    const [temples, setTemples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Time Slot Logic
    const [currentTime, setCurrentTime] = useState(new Date());
    const [session, setSession] = useState<'morning' | 'evening'>('morning');

    useEffect(() => {
        // Initial Fetch
        const fetchData = async () => {
            try {
                const [t, p, g] = await Promise.all([
                    axios.get(`${API_BASE_URL}/temples`),
                    axios.get(`${API_BASE_URL}/poonam`),
                    axios.get(`${API_BASE_URL}/grahan`)
                ]);
                const templeList = t.data || [];
                setTemples(templeList);
                setStats({
                    temples: templeList.length,
                    poonam: p.data?.length || 0,
                    grahan: g.data?.length || 0
                });
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchData();

        // Clock & Session Logic
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now);
            const hour = now.getHours();
            // User requested: Morning 6-11, Evening 6-10. 
            // We default to Morning until 2 PM, then switch to Evening for better flow.
            if (hour >= 14) setSession('evening');
            else setSession('morning');
        };
        updateTime();
        const timer = setInterval(updateTime, 60000); // Update every min
        return () => clearInterval(timer);
    }, []);

    const getTaskStatus = (temple: any) => {
        const today = new Date().toISOString().slice(0, 10);
        const dailyData = temple.videos?.[today] || {};
        const activeTypes = temple.activeContentTypes || ['morningDarshan', 'eveningDarshan', 'morningAarti', 'eveningAarti'];

        // Filter requirements based on current session
        const requiredTypes = session === 'morning'
            ? ['morningDarshan', 'morningAarti']
            : ['eveningDarshan', 'eveningAarti'];

        // Check which relevant types are configured for this specific temple
        const relevantTypes = requiredTypes.filter(type => activeTypes.includes(type));

        if (relevantTypes.length === 0) return 'NOT_APPLICABLE'; // No tasks for this slot

        // Check if all relevant types have data
        const isComplete = relevantTypes.every(type => dailyData[type]);
        return isComplete ? 'COMPLETED' : 'PENDING';
    };

    const pendingTemples = temples.filter(t => getTaskStatus(t) === 'PENDING');
    const completedTemples = temples.filter(t => getTaskStatus(t) === 'COMPLETED');

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32">
            {/* Header & Clock */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Overview & Daily Tasks</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 text-2xl font-bold text-gray-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                        <Clock className="text-orange-500" />
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* Session Toggle / Indicator */}
            <div className="mb-8 flex justify-center">
                <div className="bg-gray-100 p-1 rounded-full flex relative">
                    <button
                        onClick={() => setSession('morning')}
                        className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-all ${session === 'morning' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Sun size={18} /> Morning
                    </button>
                    <button
                        onClick={() => setSession('evening')}
                        className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-all ${session === 'evening' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Moon size={18} /> Evening
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Temples</p>
                        <h2 className="text-2xl font-bold text-gray-800">{stats.temples}</h2>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><LayoutDashboard size={24} /></div>
                </div>
                {/* Simplified other stats for cleaner UI */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Pending Tasks ({session})</p>
                        <h2 className="text-2xl font-bold text-orange-600">{pendingTemples.length}</h2>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Clock size={24} /></div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Completed ({session})</p>
                        <h2 className="text-2xl font-bold text-green-600">{completedTemples.length}</h2>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={24} /></div>
                </div>
            </div>

            {/* TASK SECTIONS */}
            <div className="grid md:grid-cols-2 gap-8">

                {/* Pending Column */}
                <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Pending Uploads
                    </h3>
                    <div className="space-y-4">
                        {pendingTemples.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
                                <CheckCircle2 className="mx-auto mb-2 text-green-500" size={32} />
                                <p>All {session} tasks completed!</p>
                            </div>
                        ) : (
                            pendingTemples.map(t => (
                                <div key={t._id || t.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                                {t.image && <img src={t.image} className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{t.name}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-1">{t.location}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/temples', { state: { edit: t, quickUpload: true } })}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 flex items-center gap-2"
                                        >
                                            Upload <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Completed Column */}
                <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Completed
                    </h3>
                    <div className="space-y-4">
                        {completedTemples.length === 0 ? (
                            <div className="py-10 text-center text-gray-400">
                                <p>No completed uploads yet.</p>
                            </div>
                        ) : (
                            completedTemples.map(t => (
                                <div key={t._id || t.id} className="bg-white p-4 rounded-xl shadow-sm border border-green-100 opacity-80 hover:opacity-100 transition-all">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden grayscale">
                                                {t.image && <img src={t.image} className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 line-through decoration-gray-400">{t.name}</h4>
                                                <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full w-fit mt-1">
                                                    <CheckCircle2 size={10} /> Done
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
