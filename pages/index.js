'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock } from 'lucide-react';
import DOMPurify from 'dompurify';
import axios from 'axios';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        // ขอ CSRF token เมื่อ component mount
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch('/api/auth/csrf');
                const data = await response.json();
                setCsrfToken(data.csrfToken);
            } catch (err) {
                console.error('Failed to fetch CSRF token:', err);
            }
        };
        
        fetchCsrfToken();
    }, []);

    const validateInput = (input) => {
        const sanitized = DOMPurify.sanitize(input).trim();
        return /^[a-zA-Z0-9_]{3,20}$/.test(sanitized);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = '/pages/dashboard';
            } else {
                setError(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                    <div className="flex justify-center mb-8">
                        <img 
                            className="h-48 w-auto" 
                            src="/jewellista.png" 
                            alt="Jewellista Logo" 
                        />
                    </div>
                    
                    
                    {error && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-100 focus:border-neutral-300 transition-colors text-sm placeholder:text-neutral-400"
                                    placeholder="ชื่อผู้ใช้"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-100 focus:border-neutral-300 transition-colors text-sm placeholder:text-neutral-400"
                                    placeholder="รหัสผ่าน"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </form>
                </div>
                
            </div>
        </div>
    );
}