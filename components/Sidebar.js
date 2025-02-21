import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="relative w-64 bg-white shadow-sm border-r border-gray-200">
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="flex items-center justify-center h-17 border-b border-gray-200">
                    <img
                        className="h-17 w-auto"
                        src="/jewellista.png"
                        alt="Jewellista Logo"
                    />
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-4">
                    <div className="space-y-2">
                        <a 
                            href="/pages/dashboard" 
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium ${
                                pathname === '/pages/dashboard' 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Dashboard</span>
                        </a>
                        <a 
                            href="/pages/stock" 
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                                pathname === '/pages/stock' 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span>Stock</span>
                        </a>
                        <a 
                            href="/pages/orders"
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                                pathname === '/pages/orders' 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Orders</span>
                        </a>
                        <a 
                            href="/pages/reports"
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                                pathname === '/pages/reports' 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Reports</span>
                        </a>
                        <a 
                            href="/pages/chat"
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                                pathname === '/pages/chat' 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Chat Support</span>
                        </a>
                        <a 
                            href="/pages/settings"
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                                pathname === '/pages/settings' 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Settings</span>
                        </a>
                    </div>
                </nav>
            </div>
        </div>
    );
} 