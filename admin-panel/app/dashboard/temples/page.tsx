'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Upload, Loader2, ArrowLeft, Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { Temple } from '@/lib/types';

// Local types to ensure stability
type VideoContent = {
  morningAarti?: string;
  eveningAarti?: string;
  morningDarshan?: string;
  eveningDarshan?: string;
};

type VideosByDate = {
  [date: string]: VideoContent;
};

export default function TemplesPage() {
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [temples, setTemples] = useState<Temple[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Temple>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      alert('Failed to load temples. Check console.');
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
    if (!confirm('Are you sure you want to delete this temple?')) return;
    try {
      await fetch(`/api/temples?id=${id}`, { method: 'DELETE' });
      fetchTemples();
    } catch (e) { alert('Delete failed'); }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.location) return alert('Name and Location are required');

    setIsLoading(true);
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const res = await fetch('/api/temples', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchTemples();
        setView('LIST');
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'Save failed'));
      }
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- CHUNKED UPLOAD LOGIC ---
  const uploadFile = async (file: File) => {
    const CHUNK_SIZE = 500 * 1024; // 500KB
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
        setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
        if (data.completed) return data.url;
      }
    } else {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.url;
    }
  };

  const handleCoverUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, image: url }));
    } catch (e: any) {
      alert('Upload failed: ' + e.message);
    } finally { setIsUploading(false); }
  };

  const handleContentUpload = async (file: File, key: keyof VideoContent, date: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadFile(file);
      setFormData(prev => {
        const videos: VideosByDate = { ...(prev.videos || {}) };
        const dayContent: VideoContent = { ...(videos[date] || {}) };
        dayContent[key] = url;
        videos[date] = dayContent;
        return { ...prev, videos };
      });
    } catch (e: any) {
      alert('Upload failed: ' + e.message);
    } finally { setIsUploading(false); }
  };

  const removeContent = (key: keyof VideoContent, date: string) => {
    setFormData(prev => {
      const videos: VideosByDate = { ...(prev.videos || {}) };
      const dayContent: VideoContent = { ...(videos[date] || {}) };
      delete dayContent[key];
      videos[date] = dayContent;
      return { ...prev, videos };
    });
  };

  const getPreview = (key: keyof VideoContent, date: string) => {
    if (!formData.videos) return null;
    return formData.videos[date]?.[key];
  };

  // --- RENDER ---

  if (view === 'LIST') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Temples</h1>
          <button onClick={handleCreate} className="bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-md">
            <Plus size={20} /> Add Temple
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-orange-600" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {temples.map(t => (
              <div key={t.id} className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 relative group">
                  {t.image ? (
                    <img src={t.image} className="w-full h-full object-cover" alt={t.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={48} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{t.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{t.location}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(t)} className="flex-1 py-2 border border-orange-500 text-orange-600 font-medium rounded hover:bg-orange-50 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 border border-red-200 text-red-500 rounded hover:bg-red-50">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {temples.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400">
                No temples found. Create one to get started.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      <button onClick={() => setView('LIST')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to List
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
        <div className="bg-orange-50 p-6 border-b border-orange-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{formData.id ? 'Edit Temple' : 'New Temple'}</h2>
          {isUploading && <div className="flex items-center gap-2 text-orange-600 font-medium"><Loader2 className="animate-spin" size={20} /> Uploading {uploadProgress}%</div>}
        </div>

        <div className="p-8 space-y-8">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">English Details</h3>
              <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Temple Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Location" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" rows={3} placeholder="Description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">Hindi Details</h3>
              <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Temple Name (Hindi)" value={formData.nameHindi || ''} onChange={e => setFormData({ ...formData, nameHindi: e.target.value })} />
              <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Location (Hindi)" value={formData.locationHindi || ''} onChange={e => setFormData({ ...formData, locationHindi: e.target.value })} />
              <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" rows={3} placeholder="Description (Hindi)" value={formData.descriptionHindi || ''} onChange={e => setFormData({ ...formData, descriptionHindi: e.target.value })} />
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
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer shadow-sm">
                  <Upload size={18} /> Upload Image
                  <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
                </label>
                <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG, WebP</p>
              </div>
            </div>
          </div>

          {/* Daily Content */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg">Daily Content</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Select Date:</span>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border rounded-lg bg-white font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photos */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-600 uppercase text-sm tracking-wider">Darshan (Photos)</h4>
                {['morningDarshan', 'eveningDarshan'].map((k) => {
                  const key = k as keyof VideoContent;
                  const url = getPreview(key, selectedDate);
                  return (
                    <div key={key} className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0 border">
                        {url ? <img src={url} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-8 text-gray-300" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm capitalize mb-3 text-gray-800">{key.replace(/([A-Z])/g, ' $1')}</p>
                        {url ? (
                          <button onClick={() => removeContent(key, selectedDate)} className="text-red-500 text-xs hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1 transition-colors"><Trash2 size={14} /> Remove</button>
                        ) : (
                          <label className="text-blue-600 text-xs cursor-pointer hover:bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors">
                            <Upload size={14} /> Upload Photo
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
                <h4 className="font-semibold text-gray-600 uppercase text-sm tracking-wider">Aarti (Videos)</h4>
                {['morningAarti', 'eveningAarti'].map((k) => {
                  const key = k as keyof VideoContent;
                  const url = getPreview(key, selectedDate);
                  return (
                    <div key={key} className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0 border relative">
                        {url ? <video src={url} className="w-full h-full object-cover" muted /> : <VideoIcon className="m-auto mt-8 text-gray-300" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm capitalize mb-3 text-gray-800">{key.replace(/([A-Z])/g, ' $1')}</p>
                        {url ? (
                          <div className="flex gap-2">
                            <a href={url} target="_blank" className="text-blue-600 text-xs hover:underline bg-blue-50 px-2 py-1 rounded">Preview</a>
                            <button onClick={() => removeContent(key, selectedDate)} className="text-red-500 text-xs hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1"><Trash2 size={14} /> Remove</button>
                          </div>
                        ) : (
                          <label className="text-blue-600 text-xs cursor-pointer hover:bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors">
                            <Upload size={14} /> Upload Video
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
          <button onClick={() => setView('LIST')} className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="px-8 py-2 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save Temple'}
          </button>
        </div>
      </div>
    </div>
  );
}
