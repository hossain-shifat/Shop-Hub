import { NextResponse } from 'next/server'

// ================= CONFIG =================
const PROTECTED_ROUTES = [
    '/add-product',
    '/profile',
    '/settings',
    '/dashboard',
]

// ================= MIDDLEWARE =================
export function middleware(request) {
    const { pathname } = request.nextUrl

    // Skip Next.js internals and static assets
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    )

    if (!isProtectedRoute) {
        return NextResponse.next()
    }

    // Auth check (adjust cookie name to your auth system)
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

// ================= MATCHER =================
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
}
