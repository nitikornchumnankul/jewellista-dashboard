export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // ลบ token cookie
        res.setHeader(
            'Set-Cookie', [
                'token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
                'token=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
            ]
        );

        // เพิ่ม headers เพื่อป้องกันการ cache
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.setHeader('Pragma', 'no-cache');

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการออกจากระบบ' });
    }
} 