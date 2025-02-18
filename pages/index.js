import Link from "next/link";
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        
        // ตรวจสอบ credentials
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
            // ถ้าถูกต้องให้ redirect ไปที่หน้า dashboard
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                {/* Logo */}
                <div className="flex justify-center">
                    <img className="h-20 w-auto" src="/jewellista.png" alt="Jewellista Logo" />
                </div>
                
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    เข้าสู่ระบบ
                </h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">ชื่อผู้ใช้</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="ชื่อผู้ใช้"
                                value={credentials.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">รหัสผ่าน</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="รหัสผ่าน"
                                value={credentials.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            เข้าสู่ระบบ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}