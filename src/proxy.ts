import { NextRequest } from 'next/server';
import middleware from 'next-auth/middleware';

export default async function proxy(req: NextRequest, event: any) {
  return (middleware as any)(req, event);
}

export const config = {
  matcher: ['/((?!login|register|api/|_next/static|_next/image|favicon.ico).*)'],
};
