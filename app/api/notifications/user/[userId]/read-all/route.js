import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// PATCH - Mark all notifications as read
export async function PATCH(request, { params }) {
    try {
        const { userId } = params

        const response = await fetch(
            `${API_URL}/notifications/user/${userId}/read-all`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: data.error || 'Failed to mark all as read' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Mark all as read error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// app/api/notifications/user/[userId]/clear-read/route.js
// DELETE - Clear all read notifications
export async function DELETE(request, { params }) {
    try {
        const { userId } = params

        const response = await fetch(
            `${API_URL}/notifications/user/${userId}/clear-read`,
            {
                method: 'DELETE',
            }
        )

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: data.error || 'Failed to clear read notifications' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Clear read notifications error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
