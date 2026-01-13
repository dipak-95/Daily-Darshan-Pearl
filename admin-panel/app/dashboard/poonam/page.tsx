
'use client';

import { useState, useEffect } from 'react';
import { Poonam } from '@/lib/types';
import { Plus, Edit2, Trash2, X, Save, Moon, Loader2 } from 'lucide-react';

export default function PoonamPage() {
    const [poonams, setPoonams] = useState<Poonam[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState<Partial<Poonam>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/poonam');
            const data = await res.json();
            setPoonams(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this Poonam entry?')) {
            await fetch(`/api/poonam?id=${id}`, { method: 'DELETE' });
            fetchData();
        }
    };

    const handleSave = async () => {
        if (!current.startDateTime || !current.endDateTime || !current.description || !current.descriptionHindi)
            return alert('All fields (including English & Hindi descriptions) are required');

        const method = current.id ? 'PUT' : 'POST';
        const res = await fetch('/api/poonam', {
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

    const handleEdit = (item: Poonam) => {
        setCurrent({ ...item });
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrent({ startDateTime: '', endDateTime: '', description: '' });
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
                <h1 className="text-2xl font-bold text-saffron-dark">Poonam Management</h1>
                <button
                    onClick={handleCreate}
                    className="bg-saffron hover:bg-saffron-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                >
                    <Plus size={18} /> Add Poonam
                </button>
            </div>

            {isEditing ? (
                <div className="bg-white p-6 rounded-xl border border-saffron/20 shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-brown">
                            {current.id ? 'Edit Poonam' : 'New Poonam'}
                        </h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-saffron text-white rounded-lg hover:bg-saffron-dark flex items-center gap-2">
                                <Save size={18} /> Save
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {poonams.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-saffron/20 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-saffron/10 rounded-full text-saffron-dark">
                                    <Moon size={24} />
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

                            {item.description && (
                                <p className="text-gray-600 text-sm border-t pt-2">{item.description}</p>
                            )}
                        </div>
                    ))}
                    {poonams.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 italic">
                            No Poonam dates added yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
