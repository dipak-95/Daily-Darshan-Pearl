'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Church, Moon, Sun, Settings, LogOut } from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Temples', icon: Church, href: '/dashboard/temples' },
    { name: 'Poonam', icon: Moon, href: '/dashboard/poonam' },
    { name: 'Grahan', icon: Sun, href: '/dashboard/grahan' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-cream-light border-r border-saffron/20 h-full flex flex-col">
            <div className="p-6 border-b border-saffron/10">
                <h1 className="text-2xl font-bold text-saffron-dark">Daily Darshan</h1>
                <p className="text-xs text-brown uppercase tracking-wider mt-1">Admin Panel</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-saffron text-white shadow-md'
                                    : 'text-brown hover:bg-saffron/10'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-saffron/10">
                <Link
                    href="/login"
                    className="flex items-center gap-3 px-4 py-3 text-brown hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </Link>
            </div>
        </div>
    );
}
