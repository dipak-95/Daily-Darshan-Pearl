'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const validEmails = ['dailydarhanadmin@pearl.com', 'dailydarshanadmin@pearl.com'];
        if (validEmails.includes(email) && password === 'DailyDarshanPearl') {
            // Set a fake cookie or token
            document.cookie = "admin_auth=true; path=/";
            router.push('/dashboard');
        } else {
            alert('Invalid Credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-saffron/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-saffron-dark mb-2">Daily Darshan Pearl</h1>
                    <p className="text-brown">Admin Login</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-brown-dark mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-brown/30 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-colors"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brown-dark mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-brown/30 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-saffron hover:bg-saffron-dark text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg transform active:scale-95"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
