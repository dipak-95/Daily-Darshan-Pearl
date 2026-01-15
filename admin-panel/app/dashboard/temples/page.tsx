'use client';

import { useState, useEffect } from 'react';
import { Temple } from '@/lib/types';
import { Plus, Trash2, Save, Upload, Loader2, RefreshCcw, Image as ImageIcon, Video, X } from 'lucide-react';

export default function TemplesPage() {
    const [temples, setTemples] = useState<Temple[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
    const [formData, setFormData] = useState<Partial<Temple>>({});
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => { fetchTemples(); }, []);

    const fetchTemples = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/temples');
            if (res.ok) setTemples(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const startCreate = () => {
        setFormData({
            activeContentTypes: ['morningAarti', 'eveningAarti', 'morningDarshan', 'eveningDarshan'],
            videos: {}
        });
        setUploadError(null);
        setView('FORM');
    };

    const startEdit = (t: Temple) => {
        setFormData(JSON.parse(JSON.stringify(t)));
        setUploadError(null);
        setView('FORM');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this temple?')) return;
        try {
            await fetch(`/api/temples?id=${id}`, { method: 'DELETE' });
            fetchTemples();
        } catch (e) { alert('Delete failed'); }
    };

    const handleSave = async () => {
        // Basic Validation
        if (!formData.name || !formData.location) {
            alert('Name and Location are required!');
            return;
        }

        try {
            const method = formData.id ? 'PUT' : 'POST';
            const res = await fetch('/api/temples', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchTemples();
                setView('LIST');
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'Unknown'}`);
            }
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleUpload = async (file: File, field: string, dateKey?: string) => {
        setUploading(true);
        setUploadError(null);

        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await res.json();

            if (!data.success) throw new Error(data.message || 'Upload failed');

            // Update State
            if (dateKey) {
                // Determine if it's morning/evening/aarti
                setFormData(prev => ({
                    ...prev,
                    videos: {
                        ...prev.videos,
                        [dateKey]: {
                            ...(prev.videos?.[dateKey] || {}),
                            [field]: data.url
                        }
                    }
                }));
            } else {
                // Main image
                setFormData(prev => ({ ...prev, [field]: data.url }));
            }
        } catch (e: any) {
            console.error(e);
            setUploadError(`Upload Error: ${e.message}`);
            alert(`Upload Failed: ${e.message}`);
        } finally {
            setUploading(false);
        }
    };

    // --- Sub-Components (Inline for simplicity) ---

    if (loading && view === 'LIST') return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-saffron" size={40} /></div>;

    // LIST VIEW
    if (view === 'LIST') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-saffron/20">
                    <div>
                        <h1 className="text-2xl font-bold text-brown-dark">Temple Management</h1>
                        <p className="text-gray-500 text-sm">Manage temples, darshans, and aartis</p>
                    </div>
                    <button onClick={startCreate} className="bg-saffron hover:bg-saffron-dark text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow transition-all font-medium">
                        <Plus size={20} /> Add New Temple
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {temples.map(t => (
                        <div key={t.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                {t.image ? (
                                    <img src={t.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={t.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon size={40} opacity={0.5} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete(t.id)} className="bg-red-500 text-white p-2 rounded-full shadow-sm hover:bg-red-600"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-brown-dark mb-1">{t.name} <span className="text-sm font-normal text-gray-500">({t.nameHindi})</span></h3>
                                <p className="text-sm text-gray-500 mb-4">{t.location}</p>
                                <button onClick={() => startEdit(t)} className="w-full py-2 border border-saffron text-saffron font-medium rounded-lg hover:bg-saffron/5 transition-colors">
                                    Manage Content
                                </button>
                            </div>
                        </div>
                    ))}
                    {temples.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            No temples found. Add one to get started.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // FORM VIEW
    const today = new Date().toLocaleDateString('en-CA');
    const [selectedDate, setSelectedDate] = useState(today);

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-saffron/20 overflow-hidden">
            <div className="bg-cream border-b border-saffron/20 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-brown-dark">{formData.id ? 'Edit Temple' : 'Create Temple'}</h2>
                <button onClick={() => setView('LIST')} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-8">
                {/* 1. Basic Info */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-saffron uppercase tracking-wider border-b pb-2 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-saffron/50 outline-none" placeholder="Temple Name (English)" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-saffron/50 outline-none" placeholder="Location (English)" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                            <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-saffron/50 outline-none" rows={3} placeholder="Description (English)" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="space-y-4">
                            <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-saffron/50 outline-none font-hindi" placeholder="Temple Name (Hindi)" value={formData.nameHindi || ''} onChange={e => setFormData({ ...formData, nameHindi: e.target.value })} />
                            <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-saffron/50 outline-none font-hindi" placeholder="Location (Hindi)" value={formData.locationHindi || ''} onChange={e => setFormData({ ...formData, locationHindi: e.target.value })} />
                            <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-saffron/50 outline-none font-hindi" rows={3} placeholder="Description (Hindi)" value={formData.descriptionHindi || ''} onChange={e => setFormData({ ...formData, descriptionHindi: e.target.value })} />
                        </div>
                    </div>
                </section>

                {/* 2. Main Image */}
                <section>
                    <h3 className="text-sm font-bold text-saffron uppercase tracking-wider border-b pb-2 mb-4">Cover Image</h3>
                    <div className="flex gap-4 items-start">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border flex-shrink-0">
                            {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon /></div>}
                        </div>
                        <div className="flex-1">
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors">
                                <Upload size={18} /> <span>Upload Cover</span>
                                <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'image')} />
                            </label>
                            {uploading && <span className="ml-3 text-sm text-saffron animate-pulse">Uploading...</span>}
                            {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
                        </div>
                    </div>
                </section>

                {/* 3. Daily Content */}
                <section className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-saffron uppercase tracking-wider">Daily Content</h3>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border rounded-md bg-white font-medium text-brown-dark outline-none focus:border-saffron" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['morningDarshan', 'eveningDarshan'].map(key => (
                            <div key={key} className="bg-white p-4 rounded-lg border shadow-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-brown text-sm uppercase">{key.replace('Darshan', ' Darshan (Photo)')}</span>
                                    {formData.videos?.[selectedDate]?.[key] && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Uploaded</span>}
                                </div>
                                {formData.videos?.[selectedDate]?.[key] ? (
                                    <div className="relative group">
                                        <img src={formData.videos[selectedDate][key]} className="w-full h-40 object-cover rounded bg-gray-100" />
                                        <button onClick={() => {
                                            const v = { ...formData.videos };
                                            delete v[selectedDate][key];
                                            setFormData({ ...formData, videos: v });
                                        }} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                    </div>
                                ) : (
                                    <label className="h-40 border-2 border-dashed rounded flex flex-col items-center justify-center text-gray-400 hover:border-saffron/50 hover:bg-saffron/5 cursor-pointer transition-all">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs">Upload Photo</span>
                                        <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], key, selectedDate)} />
                                    </label>
                                )}
                            </div>
                        ))}
                        {['morningAarti', 'eveningAarti'].map(key => (
                            <div key={key} className="bg-white p-4 rounded-lg border shadow-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-brown text-sm uppercase">{key.replace('Aarti', ' Aarti (Video)')}</span>
                                    {formData.videos?.[selectedDate]?.[key] && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Uploaded</span>}
                                </div>
                                {formData.videos?.[selectedDate]?.[key] ? (
                                    <div className="relative group">
                                        <video src={formData.videos[selectedDate][key]} className="w-full h-40 object-cover rounded bg-black" controls />
                                        <button onClick={() => {
                                            const v = { ...formData.videos };
                                            delete v[selectedDate][key];
                                            setFormData({ ...formData, videos: v });
                                        }} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                    </div>
                                ) : (
                                    <label className="h-40 border-2 border-dashed rounded flex flex-col items-center justify-center text-gray-400 hover:border-saffron/50 hover:bg-saffron/5 cursor-pointer transition-all">
                                        <Video size={24} className="mb-2" />
                                        <span className="text-xs">Upload Video</span>
                                        <input type="file" hidden accept="video/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], key, selectedDate)} />
                                    </label>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="bg-gray-50 p-6 border-t flex justify-end gap-4">
                <button onClick={() => setView('LIST')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button onClick={handleSave} className="px-8 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-lg font-bold shadow-lg shadow-saffron/20 transition-all flex items-center gap-2">
                    <Save size={18} /> Save Temple
                </button>
            </div>
        </div>
    );
}
