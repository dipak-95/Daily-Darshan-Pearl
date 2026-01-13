'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full shadow-lg z-20">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex animate-in fade-in duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="bg-white h-full relative shadow-2xl animate-in slide-in-from-left duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Mobile Menu Header */}
                        <div className="flex items-center justify-between p-4 border-b border-saffron/10 bg-cream-light">
                            <h1 className="text-xl font-bold text-saffron-dark">Daily Darshan</h1>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <Sidebar onItemClick={() => setIsMobileMenuOpen(false)} />
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col h-full overflow-hidden w-full bg-gray-50/50">
                {/* Mobile Header Bar */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-saffron/10 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 hover:bg-saffron/10 rounded-lg text-brown transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-lg text-saffron-dark">Admin Panel</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
                    <div className="max-w-7xl mx-auto pb-10">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
