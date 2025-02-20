import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // สร้าง CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    // ตั้งค่า CSRF token ใน cookie
    res.setHeader(
        'Set-Cookie',
        `XSRF-TOKEN=${csrfToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
    );
    
    res.status(200).json({ csrfToken });
} 