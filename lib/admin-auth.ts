import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

export function authenticateAdmin(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    try {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : request.cookies.get('admin_token')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin?: boolean; [key: string]: any };
      
  if (!decoded?.isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Add admin info to request
  (request as unknown as { admin?: unknown }).admin = decoded;

  return handler(request, ...args);
    } catch (error) {
      console.error('Admin authentication error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}

export function verifyAdminToken(token: string) {
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin?: boolean; [key: string]: any };
  return decoded?.isAdmin ? decoded : null;
  } catch {
    return null;
  }
}
