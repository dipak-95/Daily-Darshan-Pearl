
'use client';

import { useState, useEffect } from 'react';
import { Grahan } from '@/lib/types';
import { Plus, Edit2, Trash2, X, Save, Sun, Loader2 } from 'lucide-react';

export default function GrahanPage() {
    const [grahans, setGrahans] = useState<Grahan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState<Partial<Grahan>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/grahan');
            const data = await res.json();
            setGrahans(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this Grahan entry?')) {
            await fetch(`/api/grahan?id=${id}`, { method: 'DELETE' });
            fetchData();
        }
    };

    const handleSave = async () => {
        if (!current.startDateTime || !current.endDateTime || !current.affectedPlaces || !current.affectedPlacesHindi || !current.description || !current.descriptionHindi)
            return alert('All fields (including Hindi versions) are required');

        const method = current.id ? 'PUT' : 'POST';
        const res = await fetch('/api/grahan', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(current)
        });

        if (res.ok) {
            fetchData();
            setIsEditing(false);
        } else {
            alert('Failed to save');
        }
    };

    const handleEdit = (item: Grahan) => {
        setCurrent({ ...item });
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrent({ startDateTime: '', endDateTime: '', affectedPlaces: '', description: '' });
        setIsEditing(true);
    };

    const formatDate = (isoString?: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin text-saffron inline" size={32} /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-saffron-dark">Grahan Management</h1>
                <button
                    onClick={handleCreate}
                    className="bg-saffron hover:bg-saffron-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                >
                    <Plus size={18} /> Add Grahan
                </button>
            </div>

            {isEditing ? (
                <div className="bg-white p-6 rounded-xl border border-saffron/20 shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-brown">
                            {current.id ? 'Edit Grahan' : 'New Grahan'}
                        </h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 border rounded-md focus:border-saffron focus:ring-1 focus:ring-saffron outline-none"
                                    value={current.startDateTime || ''}
                                    onChange={e => setCurrent({ ...current, startDateTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 border rounded-md focus:border-saffron focus:ring-1 focus:ring-saffron outline-none"
                                    value={current.endDateTime || ''}
                                    onChange={e => setCurrent({ ...current, endDateTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Affected Places (English)</label>
                                <input
                                    className="w-full p-2 border rounded-md focus:border-saffron focus:ring-1 focus:ring-saffron outline-none"
                                    value={current.affectedPlaces || ''}
                                    onChange={e => setCurrent({ ...current, affectedPlaces: e.target.value })}
                                    placeholder="e.g. India, USA..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Affected Places (Hindi)</label>
                                <input
                                    className="w-full p-2 border rounded-md focus:border-saffron focus:ring-1 focus:ring-saffron outline-none"
                                    value={current.affectedPlacesHindi || ''}
                                    onChange={e => setCurrent({ ...current, affectedPlacesHindi: e.target.value })}
                                    placeholder="e.g. भारत, अमेरिका..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Description (English)</label>
                                <textarea
                                    className="w-full p-2 border rounded-md focus:border-saffron focus:ring-1 focus:ring-saffron outline-none"
                                    rows={3}
                                    value={current.description || ''}
                                    onChange={e => setCurrent({ ...current, description: e.target.value })}
                                    placeholder="Details..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Description (Hindi)</label>
                                <textarea
                                    className="w-full p-2 border rounded-md focus:border-saffron focus:ring-1 focus:ring-saffron outline-none"
                                    rows={3}
                                    value={current.descriptionHindi || ''}
                                    onChange={e => setCurrent({ ...current, descriptionHindi: e.target.value })}
                                    placeholder="विवरण..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-saffron text-white rounded-lg hover:bg-saffron-dark flex items-center gap-2">
                            <Save size={18} /> Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grahans.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-saffron/20 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-saffron/10 rounded-full text-saffron-dark">
                                    <Sun size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Starts</span>
                                    <p className="text-brown-dark font-medium">{formatDate(item.startDateTime)}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Ends</span>
                                    <p className="text-brown-dark font-medium">{formatDate(item.endDateTime)}</p>
                                </div>
                            </div>

                            <div className="mb-2">
                                <span className="text-xs font-semibold text-saffron bg-saffron/10 px-2 py-1 rounded">
                                    Places: {item.affectedPlaces}
                                </span>
                            </div>

                            <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                        </div>
                    ))}
                    {grahans.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 italic">
                            No Grahan dates added yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
