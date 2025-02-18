import React from 'react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 right-0 left-64 z-10 bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-17">
                    {/* Left side - Page Title */}
                    <h1 className="text-xl font-semibold text-gray-800">Stock Management</h1>

                    {/* Right side - User Controls */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="hidden md:flex items-center">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Notifications */}
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center space-x-3">
                            <img
                                className="h-8 w-8 rounded-full"
                                src="/jewellista.png"
                                alt="User avatar"
                            />
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-700">Admin</p>
                                <p className="text-xs text-gray-500">Admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
} 