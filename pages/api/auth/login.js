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
  console.log('=== Login Request ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    
    console.log('Checking credentials:', { username, password });

    if (username === 'admin' && password === 'admin123') {
      console.log('Login successful');
      const token = 'admin-token';
      
      res.setHeader(
        'Set-Cookie',
        `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
      );

      return res.status(200).json({ success: true });
    } else {
      console.log('Invalid credentials');
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
}