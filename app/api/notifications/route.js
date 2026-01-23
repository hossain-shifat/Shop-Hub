import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// GET - Fetch user notifications
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const limit = searchParams.get('limit') || '50'
        const unreadOnly = searchParams.get('unreadOnly') || 'false'

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            )
        }

        const response = await fetch(
            `${API_URL}/notifications/user/${userId}?limit=${limit}&unreadOnly=${unreadOnly}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: data.error || 'Failed to fetch notifications' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Notifications API error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Create notification
export async function POST(request) {
    try {
        const body = await request.json()

        const response = await fetch(`${API_URL}/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: data.error || 'Failed to create notification' },
                { status: response.status }
            )
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Create notification error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
