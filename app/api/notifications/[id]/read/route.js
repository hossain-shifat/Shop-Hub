import { NextResponse } from 'next/server'

// PATCH - Mark notification as read
export async function PATCH(request, { params }) {
    try {
        const { id } = params

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Notification ID is required' },
                { status: 400 }
            )
        }

        // Forward request to backend API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
            {
                method: 'PATCH',
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
                    error: errorData.error || 'Failed to mark notification as read'
                },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('Mark notification as read error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to mark notification as read'
            },
            { status: 500 }
        )
    }
}
