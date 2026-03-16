import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Lógica simple de sentimientos (20% del esfuerzo, 80% del resultado inicial)
        const positive = ['gracias', 'excelente', 'perfecto', 'bien', 'bueno', 'si', 'sí', 'ok', 'listo', 'increible', 'feliz'];
        const critical = ['mal', 'error', 'no', 'peor', 'tarde', 'queja', 'reclamar', 'horrible', 'enojado', 'fraude'];

        const lowerText = text.toLowerCase();
        let sentiment: 'positive' | 'neutral' | 'critical' = 'neutral';

        if (critical.some(word => lowerText.includes(word))) {
            sentiment = 'critical';
        } else if (positive.some(word => lowerText.includes(word))) {
            sentiment = 'positive';
        }

        return NextResponse.json({ sentiment });
    } catch (error) {
        console.error('Sentiment Analysis Error:', error);
        return NextResponse.json({ sentiment: 'neutral' }, { status: 500 });
    }
}
