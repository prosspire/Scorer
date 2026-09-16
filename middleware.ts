import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // Check if we have a session
    const { data: { session } } = await supabase.auth.getSession()
    
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname.startsWith('/login');
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
    const isHomePage = request.nextUrl.pathname === '/';

    // If logged in
    if (session) {
        // Redirect away from home/auth to dashboard
        if (isHomePage || isAuthPage) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    } else {
        // If logged out
        // Redirect away from dashboard to login
        if (isDashboardPage) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    return response
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
