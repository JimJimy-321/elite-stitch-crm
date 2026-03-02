import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Proxy API to fetch media from WhatsApp Cloud API
 * Usage: /api/chat/media/[media_id]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ mediaId: string }> }
) {
    if (!ACCESS_TOKEN) {
        return NextResponse.json({ error: 'WhatsApp config missing' }, { status: 500 });
    }

    const { mediaId } = await params;

    try {
        // 1. Get the media URL from Meta
        const metaUrl = `https://graph.facebook.com/v18.0/${mediaId}`;
        const metaResponse = await fetch(metaUrl, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        if (!metaResponse.ok) {
            const error = await metaResponse.json();
            console.error('Meta Media Info Error:', error);
            return NextResponse.json({ error: 'Failed to fetch media info' }, { status: metaResponse.status });
        }

        const { url, mime_type } = await metaResponse.json();

        // 2. Fetch the actual binary content from the temporary URL
        const mediaBinaryResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        if (!mediaBinaryResponse.ok) {
            return NextResponse.json({ error: 'Failed to fetch media binary' }, { status: mediaBinaryResponse.status });
        }

        const buffer = await mediaBinaryResponse.arrayBuffer();

        // 3. Return the media as a direct response with correct content-type
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': mime_type || 'image/webp',
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });

    } catch (error) {
        console.error('WhatsApp Media Proxy Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
