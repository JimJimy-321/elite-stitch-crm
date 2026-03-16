import { Sentiment } from '../types/chat';
import { Smile, Meh, Frown } from 'lucide-react';

interface Props {
    sentiment: Sentiment;
    showLabel?: boolean;
}

export function SentimentBadge({ sentiment, showLabel = false }: Props) {
    const config = {
        positive: { icon: Smile, color: 'text-green-600 bg-green-50', label: 'Positivo', border: 'border-green-200' },
        neutral: { icon: Meh, color: 'text-blue-600 bg-blue-50', label: 'Neutral', border: 'border-blue-200' },
        critical: { icon: Frown, color: 'text-red-600 bg-red-50', label: 'Crítico', border: 'border-red-200' },
    };

    const { icon: Icon, color, label, border } = config[sentiment] || config.neutral;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${color} ${border}`}>
            <Icon className="w-3.5 h-3.5" />
            {showLabel && label}
        </span>
    );
}
