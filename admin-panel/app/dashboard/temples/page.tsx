'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Upload, Loader2, ArrowLeft, RefreshCw, X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Temple } from '@/lib/types';

// Simple Types locally to avoid import issues
type VideoContent = {
    morningAarti?: string;
    eveningAarti?: string;
    morningDarshan?: string;
    eveningDarshan?: string;
};

export default function TemplesPage() {
    const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
    const [temples, setTemples] = useState<Temple[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Temple>>({});
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchTemples();
    }, []);

    const fetchTemples = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/temples');
            const data = await res.json();
            if (Array.isArray(data)) setTemples(data);
        } catch (e) {
            console.error(e);
            alert('Failed to load temples');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setFormData({ videos: {} });
        setView('FORM');
    };

    const handleEdit = (t: Temple) => {
        setFormData(JSON.parse(JSON.stringify(t)));
        setView('FORM');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/temples?id=${id}`, { method: 'DELETE' });
        fetchTemples();
    };

    const handleSave = async () => {
        if (!formData.name || !formData.location) return alert('Name and Location required');

        setIsLoading(true);
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
                alert('Error: ' + err.error);
            }
        } catch (e) {
            alert('Save failed');
        } finally {
            setIsLoading(false);
        }
    };

    const uploadFile = async (file: File) => {
        // Use chunked upload for files > 1MB to bypass Nginx limits
        const CHUNK_SIZE = 500 * 1024; // 500KB chunks
        if (file.size > 1024 * 1024) {
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const fileId = Math.random().toString(36).substring(7) + Date.now();

            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                const fd = new FormData();
                fd.append('chunk', chunk);
                fd.append('index', i.toString());
                fd.append('total', totalChunks.toString());
                fd.append('fileId', fileId);
                fd.append('fileName', file.name);

                const res = await fetch('/api/upload/chunk', { method: 'POST', body: fd });
                if (!res.ok) throw new Error('Chunk upload failed');

                const data = await res.json();
                if (data.completed) return data.url;
            }
        } else {
            // Simple upload for small files
            const data = new FormData();
            data.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: data });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            return json.url;
        }
    };

    const handleCoverKey = async (file: File) => {
        setIsUploading(true);
        try {
            const url = await uploadFile(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (e: any) {
            alert('Upload failed: ' + e.message);
        } finally { setIsUploading(false); }
    };

    const handleContentUpload = async (file: File, key: string, date: string) => {
        setIsUploading(true);
        try {
            const url = await uploadFile(file);
            setFormData(prev => {
                const videos = { ...prev.videos } || {};
                const dateData = videos[date] || {};
                // @ts-ignore
                dateData[key] = url;
                videos[date] = dateData;
                return { ...prev, videos };
            });
        } catch (e: any) {
            alert('Upload failed: ' + e.message);
        } finally { setIsUploading(false); }
    };

    const removeContent = (key: string, date: string) => {
        setFormData(prev => {
            const videos = { ...prev.videos } || {};
            if (videos[date]) {
                // @ts-ignore
                delete videos[date][key];
            }
            return { ...prev, videos };
        });
    };

    if (view === 'LIST') {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Temples</h1>
                    <button onClick={handleCreate} className="bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors shadow">
                        <Plus size={20} /> Add Temple
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-orange-600" size={40} /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {temples.map(t => (
                            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-48 bg-gray-100 relative">
                                    {t.image ? (
                                        <img src={t.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button onClick={() => handleDelete(t.id)} className="bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-gray-800">{t.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{t.location}</p>
                                    <button onClick={() => handleEdit(t)} className="w-full py-2 border border-orange-500 text-orange-600 font-medium rounded hover:bg-orange-50 transition-colors">
                                        Manage & Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // FORM
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <button onClick={() => setView('LIST')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6">
                <ArrowLeft size={20} /> Back to List
            </button>

            <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
                <div className="bg-orange-50 p-6 border-b border-orange-100 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">{formData.id ? 'Edit Temple' : 'New Temple'}</h2>
                    {isUploading && <div className="flex items-center gap-2 text-orange-600"><Loader2 className="animate-spin" size={20} /> Uploading...</div>}
                </div>

                <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 border-b pb-2">English Details</h3>
                            <input className="input-field" placeholder="Name (e.g. Somnath)" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input className="input-field" placeholder="Location (e.g. Gujarat)" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                            <textarea className="input-field" rows={3} placeholder="Description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 border-b pb-2">Hindi Details</h3>
                            <input className="input-field font-hindi" placeholder="Name (Hindi)" value={formData.nameHindi || ''} onChange={e => setFormData({ ...formData, nameHindi: e.target.value })} />
                            <input className="input-field font-hindi" placeholder="Location (Hindi)" value={formData.locationHindi || ''} onChange={e => setFormData({ ...formData, locationHindi: e.target.value })} />
                            <textarea className="input-field font-hindi" rows={3} placeholder="Description (Hindi)" value={formData.descriptionHindi || ''} onChange={e => setFormData({ ...formData, descriptionHindi: e.target.value })} />
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                        <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">Cover Image</h3>
                        <div className="flex items-start gap-4">
                            <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden border">
                                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32} /></div>}
                            </div>
                            <div>
                                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                                    <Upload size={18} /> Upload Image
                                    <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleCoverKey(e.target.files[0])} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800">Daily Content</h3>
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border rounded-lg" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Photos */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-600">Darshan (Photos)</h4>
                                {['morningDarshan', 'eveningDarshan'].map(key => {
                                    const url = formData.videos?.[selectedDate]?.[key];
                                    return (
                                        <div key={key} className="bg-white p-3 rounded border shadow-sm flex items-center gap-3">
                                            <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {url ? <img src={url} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-6 text-gray-300" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm capitalize mb-2">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                {url ? (
                                                    <button onClick={() => removeContent(key, selectedDate)} className="text-red-500 text-xs hover:underline flex items-center gap-1"><Trash2 size={12} /> Remove</button>
                                                ) : (
                                                    <label className="text-blue-600 text-xs cursor-pointer hover:underline flex items-center gap-1">
                                                        <Upload size={12} /> Upload Photo
                                                        <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleContentUpload(e.target.files[0], key, selectedDate)} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Videos */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-600">Aarti (Videos)</h4>
                                {['morningAarti', 'eveningAarti'].map(key => {
                                    const url = formData.videos?.[selectedDate]?.[key];
                                    return (
                                        <div key={key} className="bg-white p-3 rounded border shadow-sm flex items-center gap-3">
                                            <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {url ? <video src={url} className="w-full h-full object-cover" /> : <VideoIcon className="m-auto mt-6 text-gray-300" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm capitalize mb-2">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                {url ? (
                                                    <div className="flex gap-3">
                                                        <a href={url} target="_blank" className="text-blue-600 text-xs hover:underline">View</a>
                                                        <button onClick={() => removeContent(key, selectedDate)} className="text-red-500 text-xs hover:underline flex items-center gap-1"><Trash2 size={12} /> Remove</button>
                                                    </div>
                                                ) : (
                                                    <label className="text-blue-600 text-xs cursor-pointer hover:underline flex items-center gap-1">
                                                        <Upload size={12} /> Upload Video
                                                        <input type="file" hidden accept="video/*" onChange={e => e.target.files?.[0] && handleContentUpload(e.target.files[0], key, selectedDate)} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                    <button onClick={() => setView('LIST')} className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-200">Cancel</button>
                    <button onClick={handleSave} disabled={isLoading} className="px-8 py-2 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-lg transition-all">
                        {isLoading ? 'Saving...' : 'Save Temple'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    outline: none;
                }
                .input-field:focus {
                    border-color: #f97316;
                    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
                }
                .btn-secondary {
                    background-color: white;
                    border: 1px solid #e5e7eb;
                    color: #374151;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background-color: #f9fafb;
                    border-color: #d1d5db;
                }
            `}</style>
        </div>
    );
}
