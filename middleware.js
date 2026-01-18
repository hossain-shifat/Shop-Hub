import { NextResponse } from 'next/server'

// ---- CONFIG ----
const PROTECTED_ROUTES = [
    '/add-product',
    '/profile',
    '/settings',
    // '/cart',
    // '/checkout',
    // '/orders',
    // '/wishlist'
]

// ---- MIDDLEWARE ----
export async function middleware(request) {
    const { pathname } = request.nextUrl

    // Skip API routes and Next.js internals
    if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
        return NextResponse.next()
    }

    // Dashboard routes have their own middleware, skip here
    if (pathname.startsWith('/dashboard')) {
        return NextResponse.next()
    }

    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    if (!isProtectedRoute) {
        return NextResponse.next()
    }

    // Check for auth token (you can customize this based on your auth method)
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

// ---- MATCHER ----
export const config = {
    matcher: [
        /*
         * Match all routes except:
         * - API routes
         * - Next.js internals (_next)
         * - Static files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|icon.png).*)',
    ],
}
