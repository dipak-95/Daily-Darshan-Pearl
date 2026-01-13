
'use client';

import { useState, useEffect } from 'react';
import { Church, Moon, Sun, Loader2, Upload, CheckCircle2, Clock, Check } from 'lucide-react';
import { Temple, ContentType } from '@/lib/types';

const contentLabels: Record<ContentType, string> = {
    morningAarti: 'Morning Aarti',
    eveningAarti: 'Evening Aarti',
    morningDarshan: 'Morning Darshan',
    eveningDarshan: 'Evening Darshan'
};

export default function DashboardPage() {
    const [stats, setStats] = useState({ templeCount: 0, poonamCount: 0, grahanCount: 0 });
    const [temples, setTemples] = useState<Temple[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
    const currentHour = new Date().getHours();

    const isMorningSlot = currentHour >= 6 && currentHour <= 11;
    const isEveningSlot = currentHour >= 18 && currentHour <= 22;

    useEffect(() => {
        Promise.all([
            fetch('/api/dashboard').then(res => res.json()),
            fetch('/api/temples').then(res => res.json())
        ]).then(([statsData, templesData]) => {
            setStats(statsData);
            setTemples(templesData);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, temple: Temple, type: ContentType) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadKey = `${temple.id}-${type}`;
        setUploadingState(prev => ({ ...prev, [uploadKey]: true }));

        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();

            if (uploadData.success) {
                // 2. Update Temple Data
                const currentVideos = temple.videos?.[todayStr] || {};
                const newVideos = {
                    ...temple.videos,
                    [todayStr]: {
                        ...currentVideos,
                        [type]: uploadData.url
                    }
                };

                const updateRes = await fetch('/api/temples', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: temple.id, videos: newVideos })
                });

                if (updateRes.ok) {
                    // 3. Update Local State
                    setTemples(prev => prev.map(t =>
                        t.id === temple.id ? { ...t, videos: newVideos } : t
                    ));
                }
            } else {
                alert('Upload Failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error uploading');
        } finally {
            setUploadingState(prev => ({ ...prev, [uploadKey]: false }));
        }
    };

    // Filter Logic
    const pendingTemples = temples.filter(t => {
        const types = t.activeContentTypes || [];
        const videos = t.videos?.[todayStr] || {};
        // Is incomplete if any ACTIVE type is missing for today
        const isMissingAny = types.some(type => !videos[type]);
        // Also check if we should show it based on time slot (optional user request)
        // User requested: "morning ke liye ... evening ke liye..."
        // But also "remaining temple...". If I only show Pending, it matches requirement.
        return isMissingAny;
    });

    const completedTemples = temples.filter(t => !pendingTemples.includes(t));

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-saffron" size={40} /></div>;
    }

    return (
        <div className="space-y-8">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-saffron/20 flex items-center gap-3">
                    <div className="p-3 bg-saffron/10 rounded-full text-saffron"><Church size={24} /></div>
                    <div><p className="text-sm text-gray-500">Temples</p><p className="text-xl font-bold">{stats.templeCount}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-saffron/20 flex items-center gap-3">
                    <div className="p-3 bg-saffron/10 rounded-full text-saffron"><Moon size={24} /></div>
                    <div><p className="text-sm text-gray-500">Poonam</p><p className="text-xl font-bold">{stats.poonamCount}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-saffron/20 flex items-center gap-3">
                    <div className="p-3 bg-saffron/10 rounded-full text-saffron"><Sun size={24} /></div>
                    <div><p className="text-sm text-gray-500">Grahan</p><p className="text-xl font-bold">{stats.grahanCount}</p></div>
                </div>
            </div>

            {/* Time Slot Indicator */}
            <div className="flex items-center gap-2 text-brown-dark font-medium bg-cream p-3 rounded-lg border border-saffron/10">
                <Clock size={20} className="text-saffron" />
                <span>
                    Current Session: <span className="font-bold">{isMorningSlot ? 'Morning (6 AM - 11 AM)' : isEveningSlot ? 'Evening (6 PM - 10 PM)' : 'Standard'}</span>
                </span>
                <span className="text-sm text-gray-500 ml-auto">{new Date().toDateString()}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Uploads */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-brown flex items-center gap-2">
                        <Upload size={20} /> Pending Uploads
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">{pendingTemples.length}</span>
                    </h2>

                    {pendingTemples.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                            No pending uploads for today! 🎉
                        </div>
                    ) : (
                        pendingTemples.map(temple => (
                            <div key={temple.id} className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-red-500 animate-in fade-in slide-in-from-bottom-2">
                                <h3 className="font-bold text-lg mb-4">{temple.name}</h3>
                                <div className="space-y-3">
                                    {(temple.activeContentTypes || []).map(type => {
                                        const isDone = !!temple.videos?.[todayStr]?.[type];
                                        if (isDone) return null; // Don't show completed slots in pending card? Or show as checked?
                                        // User implied: "jis me photo chdane ke baki he vo niche update section me chala jaye"
                                        // So show only MISSING here.

                                        const isAarti = type.toLowerCase().includes('aarti');
                                        const isMorningType = type.toLowerCase().includes('morning');
                                        const isEveningType = type.toLowerCase().includes('evening');

                                        // Highlight based on time?
                                        const isPriority = (isMorningSlot && isMorningType) || (isEveningSlot && isEveningType);

                                        return (
                                            <div key={type} className={`flex items-center justify-between p-3 rounded-lg border ${isPriority ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-medium ${isPriority ? 'text-brown-dark' : 'text-gray-600'}`}>
                                                        {contentLabels[type]}
                                                    </span>
                                                    {isPriority && <span className="text-xs bg-saffron text-white px-2 py-0.5 rounded">NOW</span>}
                                                </div>

                                                <label className="cursor-pointer">
                                                    <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${uploadingState[`${temple.id}-${type}`] ? 'bg-gray-200 cursor-not-allowed' : 'bg-white border hover:border-saffron hover:text-saffron shadow-sm'}`}>
                                                        {uploadingState[`${temple.id}-${type}`] ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                        <span>Upload</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept={isAarti ? "video/*" : "image/*"}
                                                        className="hidden"
                                                        disabled={uploadingState[`${temple.id}-${type}`]}
                                                        onChange={(e) => handleUpload(e, temple, type)}
                                                    />
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Completed / Updates */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
                        <CheckCircle2 size={20} /> Completed Today
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">{completedTemples.length}</span>
                    </h2>

                    {completedTemples.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                            Start uploading to see progress here.
                        </div>
                    ) : (
                        completedTemples.map(temple => (
                            <div key={temple.id} className="bg-white p-4 rounded-xl border border-l-4 border-l-green-500 opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">{temple.name}</h3>
                                    <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                                        <Check size={16} /> All Content Live
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
