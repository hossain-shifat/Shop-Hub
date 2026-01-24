import { NextResponse } from 'next/server'

// GET - Fetch user notifications
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Forward request to backend API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${userId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                {
                    success: false,
                    error: errorData.error || 'Failed to fetch notifications'
                },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('Notifications API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch notifications'
            },
            { status: 500 }
        )
    }
}
