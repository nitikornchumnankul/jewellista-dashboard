'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function Login() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            setIsSubmitting(true);
            setError('');

            if (!validateInput(credentials.username)) {
                throw new Error('ชื่อผู้ใช้ไม่ถูกต้อง กรุณาใช้ตัวอักษร ตัวเลข หรือ _ เท่านั้น (3-20 ตัวอักษร)');
            }

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: DOMPurify.sanitize(credentials.username),
                    password: credentials.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            router.push('/pages/dashboard');
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
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

                    <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
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
                                    value={credentials.username}
                                    onChange={handleChange}
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
                                    value={credentials.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </form>
                </div>
                
            </div>
        </div>
    );
}