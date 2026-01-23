import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// DELETE - Delete notification
export async function DELETE(request, { params }) {
    try {
        const { id } = params

        const response = await fetch(`${API_URL}/notifications/${id}`, {
            method: 'DELETE',
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: data.error || 'Failed to delete notification' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Delete notification error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
