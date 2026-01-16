import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Church, Moon, Sun, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const menu = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Church, label: 'Temples', path: '/temples' },
        { icon: Moon, label: 'Poonam', path: '/poonam' },
        { icon: Sun, label: 'Grahan', path: '/grahan' },
    ];

    return (
        <div className="flex h-screen bg-[#FFF8F0] overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-orange-100 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">DD</div>
                    <span className="font-bold text-gray-800">Daily Darshan</span>
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-orange-100 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-orange-50">
                    <h1 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                        Daily Darshan
                    </h1>
                    <p className="text-xs text-orange-400 font-bold tracking-widest mt-1 uppercase pl-1">Admin Panel</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menu.map(item => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <button
                                key={item.label}
                                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <item.icon size={20} className={isActive ? "text-orange-600" : "text-gray-400"} />
                                {item.label}
                            </button>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-orange-50 bg-gray-50/50">
                    <button className="flex items-center gap-3 text-red-500 hover:text-red-700 hover:bg-red-50 w-full px-4 py-3 rounded-xl transition-colors font-medium">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full w-full relative">
                <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 bg-[#FFF8F0]/50">
                    {children}
                </main>
            </div>
        </div>
    );
}
