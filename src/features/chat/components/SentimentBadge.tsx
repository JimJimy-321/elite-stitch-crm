import { Sentiment } from '../types/chat';
import { Smile, Meh, Frown } from 'lucide-react';

interface Props {
    sentiment: Sentiment;
    showLabel?: boolean;
}

export function SentimentBadge({ sentiment, showLabel = false }: Props) {
    const config = {
        positive: { icon: Smile, color: 'text-green-500 bg-green-50 dark:bg-green-900/20', label: 'Positivo', border: 'border-green-200 dark:border-green-800' },
        neutral: { icon: Meh, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800', label: 'Neutral', border: 'border-gray-200 dark:border-gray-700' },
        critical: { icon: Frown, color: 'text-red-500 bg-red-50 dark:bg-red-900/20', label: 'Crítico', border: 'border-red-200 dark:border-red-800' },
    };

    const { icon: Icon, color, label, border } = config[sentiment] || config.neutral;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${color} ${border}`}>
            <Icon className="w-3.5 h-3.5" />
            {showLabel && label}
        </span>
    );
}
