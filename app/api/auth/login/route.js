import { NextResponse } from 'next/server'
import { validateCredentials, generateToken } from '@/lib/auth'

export async function POST(request) {
    try {
        const { email, password } = await request.json()

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Validate credentials
        const user = validateCredentials(email, password)

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Generate token
        const token = generateToken(user)

        // Create response with cookie
        const response = NextResponse.json(
            {
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            },
            { status: 200 }
        )

        // Set httpOnly cookie
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 24 hours
        })

        return response

    } catch (error) {
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        )
    }
}
