import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/config';
import { Plus, Trash2, Sun } from 'lucide-react';

export default function GrahanPage() {
    const [data, setData] = useState<any[]>([]);
    const [form, setForm] = useState({ title: '', date: '', type: 'Solar', startTime: '', endTime: '' });

    useEffect(() => { fetch(); }, []);
    const fetch = async () => {
        const res = await axios.get(`${API_BASE_URL}/grahan`);
        setData(res.data);
    };
    const add = async () => {
        if (!form.title || !form.date) return alert("Required fields missing");
        await axios.post(`${API_BASE_URL}/grahan`, form);
        setForm({ title: '', date: '', type: 'Solar', startTime: '', endTime: '' });
        fetch();
    };
    const del = async (id: string) => {
        await axios.delete(`${API_BASE_URL}/grahan/${id}`);
        fetch();
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl"><Sun /></div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Grahan (Eclipse)</h1>
                    <p className="text-gray-500">Upcoming Solar and Lunar Eclipses</p>
                </div>
            </div>

            {/* Add Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="font-bold text-lg mb-4">Add Event</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input placeholder="Title" className="border p-3 rounded-xl bg-gray-50 lg:col-span-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    <select className="border p-3 rounded-xl bg-gray-50" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                        <option value="Solar">Solar (Surya)</option>
                        <option value="Lunar">Lunar (Chandra)</option>
                    </select>
                    <input type="date" className="border p-3 rounded-xl bg-gray-50 lg:col-span-2" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <input type="time" placeholder="Start" className="border p-3 rounded-xl bg-gray-50" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                    <input type="time" placeholder="End" className="border p-3 rounded-xl bg-gray-50" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>

                <button onClick={add} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 w-full md:w-auto">Add Grahan</button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {data.map(item => (
                    <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${item.type === 'Solar' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                <Sun size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                                <div className="text-sm text-gray-500 flex gap-4 mt-1">
                                    <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                                    <span>⏰ {item.startTime} - {item.endTime}</span>
                                    <span className="font-semibold text-gray-700">{item.type} Eclipse</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => del(item._id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                    </div>
                ))}
            </div>
        </div>
    )
}
