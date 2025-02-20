'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock } from 'lucide-react';

export default function Login() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
            router.push('/pages/dashboard3');
        } else {
            setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                    {/* Logo Container */}
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

                    <form onSubmit={handleLogin} className="space-y-6">
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
                            className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900"
                        >
                            เข้าสู่ระบบ
                        </button>
                    </form>
                </div>
                
            </div>
        </div>
    );
}