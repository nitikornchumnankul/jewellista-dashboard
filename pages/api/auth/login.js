import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

// สร้าง rate limiter แบบง่าย
const WINDOW_MS = 15 * 60 * 1000; // 15 นาที
const MAX_REQUESTS = 5;
const ipRequests = new Map();

function checkRateLimit(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, [now]);
    return true;
  }

  const requests = ipRequests.get(ip).filter(time => time > now - WINDOW_MS);
  requests.push(now);
  ipRequests.set(ip, requests);

  return requests.length <= MAX_REQUESTS;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ตรวจสอบ rate limit
    if (!checkRateLimit(req)) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }

    const { username, password } = req.body;

    // สร้าง hash password ไว้เปรียบเทียบ (ในสถานการณ์จริงควรเก็บใน database)
    const correctPassword = 'admin123';
    const isValid = username === 'admin' && password === correctPassword;

    if (!isValid) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง token
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || 'your-secret-key', // เพิ่ม fallback secret key
      { expiresIn: '1h' }
    );

    // เก็บ token ใน httpOnly cookie
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
}