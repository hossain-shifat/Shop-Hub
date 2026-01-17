// app/api/auth/session/route.js
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request) {
    try {
        const headersList = await headers()

        // Get Firebase ID token from Authorization header
        const authHeader = headersList.get('authorization')
        const idToken = authHeader?.replace('Bearer ', '')

        if (!idToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Not authenticated - No token provided',
                    user: null
                },
                { status: 401 }
            )
        }

        // Verify Firebase token (optional - for extra security)
        // You can add Firebase Admin SDK verification here if needed

        // For now, we'll decode the token to get the user ID
        // The token is base64 encoded JWT, we'll extract the payload
        try {
            const payload = JSON.parse(
                Buffer.from(idToken.split('.')[1], 'base64').toString()
            )

            const userUid = payload.user_id || payload.sub

            if (!userUid) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid token',
                        user: null
                    },
                    { status: 401 }
                )
            }

            // Fetch user data from your backend
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/user/${userUid}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )

            if (!response.ok) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'User not found in database',
                        user: null
                    },
                    { status: 404 }
                )
            }

            const data = await response.json()

            if (!data.success || !data.user) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid user data',
                        user: null
                    },
                    { status: 400 }
                )
            }

            // Return user session data
            return NextResponse.json({
                success: true,
                user: {
                    uid: data.user.uid,
                    email: data.user.email,
                    displayName: data.user.displayName,
                    photoURL: data.user.photoURL,
                    role: data.user.role,
                    provider: data.user.provider,
                    createdAt: data.user.createdAt
                }
            })

        } catch (decodeError) {
            console.error('Token decode error:', decodeError)
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid token format',
                    user: null
                },
                { status: 401 }
            )
        }

    } catch (error) {
        console.error('Session fetch error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch session',
                user: null
            },
            { status: 500 }
        )
    }
}
