import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, UPLOAD_BASE_URL } from '../lib/config';
import { Plus, Search, MapPin, Trash2, Upload, ImageIcon, Loader2, Video as VideoIcon, Calendar, ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// TYPES
type VideoContent = {
    morningAarti?: string;
    eveningAarti?: string;
    morningDarshan?: string;
    eveningDarshan?: string;
};
type Temple = {
    id: string;
    name: string;
    nameHindi?: string;
    description: string;
    descriptionHindi?: string;
    location: string;
    locationHindi?: string;
    image: string;
    videos: Record<string, VideoContent>;
    activeContentTypes?: string[];
};

export default function TemplesPage() {
    const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
    const [temples, setTemples] = useState<Temple[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const location = useLocation();

    // Form Config
    const [formData, setFormData] = useState<Partial<Temple>>({
        activeContentTypes: ['morningDarshan', 'eveningDarshan', 'morningAarti', 'eveningAarti'] // Default to all
    });

    // Auto-open form if passed via navigation state
    useEffect(() => {
        if (location.state && (location.state as any).edit) {
            setFormData((location.state as any).edit);
            setView('FORM');
            // Clear state so it doesn't reopen on refresh/back
            window.history.replaceState({}, document.title);
        }
    }, [location]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchTemples();
    }, []);

    const fetchTemples = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/temples`);
            setTemples(res.data);
        } catch (error) {
            console.error('Failed to fetch temples:', error);
            // No alert - silent fail
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.location) return alert("Name & Location Required");

        try {
            // Ensure activeContentTypes is set
            const payload = {
                ...formData,
                activeContentTypes: formData.activeContentTypes || []
            };

            if (formData.id) {
                await axios.put(`${API_BASE_URL}/temples/${formData.id}`, payload);
            } else {
                await axios.post(`${API_BASE_URL}/temples`, payload);
            }
            fetchTemples();
            setView('LIST');
        } catch (e) {
            alert('Save failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this temple?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/temples/${id}`);
            fetchTemples();
        } catch (e) { alert("Delete failed"); }
    };

    // UPLOAD LOGIC
    const uploadFile = async (file: File) => {
        const data = new FormData();
        data.append('file', file);

        const res = await axios.post(`${API_BASE_URL}/upload`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                setUploadProgress(percentCompleted);
            }
        });

        // Ensure we get a full URL if possible, or relative path
        let url = res.data.url;
        if (url.startsWith('/')) {
            url = `${UPLOAD_BASE_URL}${url}`;
        }
        return url;
    };

    const handleCoverUpload = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);
        try {
            const url = await uploadFile(file);
            setFormData(p => ({ ...p, image: url }));
        } catch (e) { alert('Upload error'); }
        finally { setIsUploading(false); }
    };

    const handleContentUpload = async (file: File, key: keyof VideoContent) => {
        setIsUploading(true);
        setUploadProgress(0);
        try {
            const url = await uploadFile(file);
            setFormData(prev => {
                const videos = { ...(prev.videos || {}) };
                const day = { ...(videos[selectedDate] || {}) };
                day[key] = url;
                videos[selectedDate] = day;
                return { ...prev, videos };
            });
        } catch (e) { alert('Upload error'); }
        finally { setIsUploading(false); }
    };

    const toggleContentType = (type: string) => {
        setFormData(prev => {
            const current = prev.activeContentTypes || [];
            if (current.includes(type)) {
                return { ...prev, activeContentTypes: current.filter(t => t !== type) };
            } else {
                return { ...prev, activeContentTypes: [...current, type] };
            }
        });
    };

    // --- RENDER ---

    if (view === 'LIST') {
        const filteredTemples = temples.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Temples</h1>
                        <p className="text-gray-500 mt-1">Manage your temple listings and daily content</p>
                    </div>
                    <button onClick={() => { setFormData({ videos: {}, activeContentTypes: ['morningDarshan', 'eveningDarshan', 'morningAarti', 'eveningAarti'] }); setView('FORM'); }} className="w-full md:w-auto bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-orange-700 transition shadow-lg hover:shadow-orange-200">
                        <Plus size={20} /> Add New Temple
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-center gap-3">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search temples..."
                        className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemples.map(t => (
                            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {t.image ? (
                                        <img src={t.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={t.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={40} /></div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDelete(t.id)} className="p-2 bg-white/90 text-red-500 rounded-full hover:bg-red-50 shadow-sm backdrop-blur-sm">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{t.name}</h3>
                                        {t.nameHindi && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-medium">{t.nameHindi}</span>}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                                        <MapPin size={14} />
                                        <span className="line-clamp-1">{t.location}</span>
                                    </div>
                                    <button onClick={() => { setFormData(t); setView('FORM'); }} className="w-full py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                        Manage & Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredTemples.length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                No temples found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    const isQuickUpload = (location.state as any)?.quickUpload;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
            <button onClick={() => setView('LIST')} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-900 transition-colors font-medium">
                <ArrowLeft size={18} /> Back to Temples
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isQuickUpload ? `Daily Upload: ${formData.name}` : (formData.id ? 'Edit Temple' : 'Create New Temple')}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isQuickUpload ? "Upload today's media content" : "Fill in the details below"}
                        </p>
                    </div>
                    {isUploading && (
                        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} /> Uploading {uploadProgress}%
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Basic Info - HIDDEN in Quick Upload */}
                    {!isQuickUpload && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><span className="w-1 h-6 bg-orange-500 rounded-full"></span>English Details</h3>
                                    <input placeholder="Temple Name" className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none transition-all" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    <input placeholder="Location" className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none transition-all" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                    <textarea placeholder="Description" rows={3} className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none transition-all" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><span className="w-1 h-6 bg-orange-500 rounded-full"></span>Hindi Details</h3>
                                    <input placeholder="Temple Name (Hindi)" className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none transition-all" value={formData.nameHindi || ''} onChange={e => setFormData({ ...formData, nameHindi: e.target.value })} />
                                    <input placeholder="Location (Hindi)" className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none transition-all" value={formData.locationHindi || ''} onChange={e => setFormData({ ...formData, locationHindi: e.target.value })} />
                                    <textarea placeholder="Description (Hindi)" rows={3} className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none transition-all" value={formData.descriptionHindi || ''} onChange={e => setFormData({ ...formData, descriptionHindi: e.target.value })} />
                                </div>
                            </div>

                            {/* Content Configuration */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Content Configuration</h3>
                                <p className="text-sm text-gray-500 mb-4">Select which content types should be available for this temple.</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { id: 'morningDarshan', label: 'Morning Darshan' },
                                        { id: 'eveningDarshan', label: 'Evening Darshan' },
                                        { id: 'morningAarti', label: 'Morning Aarti' },
                                        { id: 'eveningAarti', label: 'Evening Aarti' },
                                    ].map(type => (
                                        <label key={type.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-orange-200 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                                checked={formData.activeContentTypes?.includes(type.id)}
                                                onChange={() => toggleContentType(type.id)}
                                            />
                                            <span className="text-gray-700 font-medium">{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Cover Image */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-gray-400" /> Cover Image</h3>
                                <div className="flex items-start gap-6 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-200 transition-colors bg-gray-50/50">
                                    <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                        {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={24} /></div>}
                                    </div>
                                    <div>
                                        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 cursor-pointer shadow-sm transition-all">
                                            <Upload size={18} /> Choose Image
                                            <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2">Recommended size: 1200x800px. Max 5MB.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Daily Content Section */}
                    <div className="bg-orange-50/50 rounded-2xl border border-orange-100 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Daily Media Content</h3>
                                <p className="text-gray-500 text-sm">Upload today's Darshan & Aarti</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-orange-100 shadow-sm">
                                <Calendar size={18} className="text-orange-500" />
                                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="outline-none text-gray-700 font-medium bg-transparent cursor-pointer" />
                            </div>
                        </div>

                        {(!formData.activeContentTypes || formData.activeContentTypes.length === 0) ? (
                            <div className="text-center py-10 text-gray-400">
                                No content types selected. Please configure above.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {['morningDarshan', 'eveningDarshan', 'morningAarti', 'eveningAarti']
                                    .filter(key => formData.activeContentTypes?.includes(key))
                                    .map(key => {
                                        const isVideo = key.includes('Aarti');
                                        const hasFile = formData.videos?.[selectedDate]?.[key as keyof VideoContent];

                                        return (
                                            <div key={key} className={`bg-white p-4 rounded-xl border shadow-sm transition-all ${hasFile ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100 hover:border-orange-200'}`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className={`p-2 rounded-lg ${isVideo ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {isVideo ? <VideoIcon size={16} /> : <ImageIcon size={16} />}
                                                    </div>
                                                    <p className="font-semibold text-sm capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                </div>

                                                {hasFile ? (
                                                    <div className="space-y-3">
                                                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-100 relative">
                                                            {isVideo ? (
                                                                <video src={hasFile} className="w-full h-full object-cover" muted />
                                                            ) : (
                                                                <img src={hasFile} className="w-full h-full object-cover" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                                <span className="bg-white/90 text-xs px-2 py-1 rounded shadow-sm font-medium">Uploaded</span>
                                                            </div>
                                                        </div>
                                                        <button className="w-full py-1.5 text-xs text-red-500 hover:bg-red-50 rounded bg-white border border-red-100 transition-colors">Replace</button>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer transition-all gap-2 group">
                                                        <Upload size={20} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
                                                        <span className="text-xs text-gray-400 group-hover:text-orange-500 font-medium">+ Upload {isVideo ? 'Video' : 'Photo'}</span>
                                                        <input type="file" hidden accept={isVideo ? "video/*" : "image/*"} onChange={e => e.target.files?.[0] && handleContentUpload(e.target.files[0], key as keyof VideoContent)} />
                                                    </label>
                                                )}
                                            </div>
                                        )
                                    })}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                        <button onClick={() => setView('LIST')} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-8 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all">Save Temple</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
