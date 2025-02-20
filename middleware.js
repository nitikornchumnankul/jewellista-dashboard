import { NextResponse } from 'next/server';

export function middleware(request) {
    // ดึง token จาก cookie
    const token = request.cookies.get('token')?.value;

    // ถ้าพยายามเข้า dashboard โดยไม่มี token
    if (request.nextUrl.pathname.startsWith('/pages/dashboard') && !token) {
        // ส่งกลับไปหน้า login
        return NextResponse.redirect(new URL('/', request.url));
    }

    // ถ้ามี token แล้วพยายามเข้าหน้า login
    if (request.nextUrl.pathname === '/' && token) {
        // ส่งไปหน้า dashboard
        return NextResponse.redirect(new URL('/pages/dashboard', request.url));
    }

    return NextResponse.next();
}

// กำหนดว่าจะใช้ middleware กับ path ไหนบ้าง
export const config = {
    matcher: ['/', '/pages/dashboard']
}; 