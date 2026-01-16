import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/config';
import { Plus, Trash2, Calendar, Moon } from 'lucide-react';

export default function PoonamPage() {
    const [data, setData] = useState<any[]>([]);
    const [form, setForm] = useState({ title: '', date: '', description: '' });

    useEffect(() => { fetch(); }, []);
    const fetch = async () => {
        const res = await axios.get(`${API_BASE_URL}/poonam`);
        setData(res.data);
    };
    const add = async () => {
        if (!form.title || !form.date) return alert("Required fields missing");
        await axios.post(`${API_BASE_URL}/poonam`, form);
        setForm({ title: '', date: '', description: '' });
        fetch();
    };
    const del = async (id: string) => {
        await axios.delete(`${API_BASE_URL}/poonam/${id}`);
        fetch();
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Moon /></div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Poonam (Full Moon)</h1>
                    <p className="text-gray-500">Manage upcoming Poonam dates</p>
                </div>
            </div>

            {/* Add Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="font-bold text-lg mb-4">Add New Date</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <input placeholder="Title (e.g. Sharad Purnima)" className="border p-3 rounded-xl bg-gray-50" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    <input type="date" className="border p-3 rounded-xl bg-gray-50" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                    <input placeholder="Description (Optional)" className="border p-3 rounded-xl bg-gray-50" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <button onClick={add} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 w-full md:w-auto">Add Poonam</button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {data.map(item => (
                    <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="text-center bg-gray-50 p-2 rounded-lg min-w-[60px]">
                                <span className="block text-xl font-bold text-gray-800">{new Date(item.date).getDate()}</span>
                                <span className="block text-xs uppercase text-gray-500">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.description}</p>
                            </div>
                        </div>
                        <button onClick={() => del(item._id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                    </div>
                ))}
                {data.length === 0 && <p className="text-center text-gray-400 py-10">No dates added yet.</p>}
            </div>
        </div>
    )
}
