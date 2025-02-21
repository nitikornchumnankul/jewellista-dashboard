export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // ลบ token cookie
        res.setHeader(
            'Set-Cookie', 
            'token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        );

        // เพิ่ม headers เพื่อป้องกันการ cache
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.setHeader('Pragma', 'no-cache');

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการออกจากระบบ' });
    }
} 