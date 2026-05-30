import { createHash, createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'shottt_secret_session_key_123!';

export interface UserSession {
  userId: number;
  username: string;
  name: string;
}

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function signSession(sessionData: UserSession): string {
  const dataStr = Buffer.from(JSON.stringify(sessionData)).toString('base64');
  const signature = createHmac('sha256', SECRET).update(dataStr).digest('hex');
  return `${dataStr}.${signature}`;
}

export function verifySession(cookieValue: string): UserSession | null {
  if (!cookieValue) return null;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  
  const [dataStr, signature] = parts;
  const expectedSignature = createHmac('sha256', SECRET).update(dataStr).digest('hex');
  
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  
  if (signatureBuf.length !== expectedBuf.length) {
    return null;
  }
  
  if (!timingSafeEqual(signatureBuf, expectedBuf)) {
    return null;
  }
  
  try {
    const jsonStr = Buffer.from(dataStr, 'base64').toString('utf8');
    return JSON.parse(jsonStr) as UserSession;
  } catch {
    return null;
  }
}

export function getSession(cookies: any): UserSession | null {
  const sessionCookie = cookies.get('admin_session')?.value;
  if (!sessionCookie) return null;
  return verifySession(sessionCookie);
}
