export type ChatStatus = 'active' | 'resolved' | 'archived' | 'pending';
export type Sentiment = 'positive' | 'neutral' | 'critical';
export type SenderRole = 'client' | 'agent' | 'system' | 'bot';

export interface ChatConversation {
    id: string;
    client_id?: string;
    branch_id: string;
    client_name: string; // Join con clients
    client_phone: string;
    status: ChatStatus;
    last_message_content: string;
    last_message_at: string;
    unread_count: number;
    sentiment_score: Sentiment;
    tags?: string[];
}

export interface ChatMessage {
    id: string;
    conversation_id: string;
    sender_role: SenderRole;
    content: string;
    media_url?: string;
    sentiment?: Sentiment;
    is_read: boolean;
    created_at: string;
    metadata?: any;
}

export interface ChatStats {
    total_active: number;
    avg_response_time: string; // ej: "2m"
    sentiment_breakdown: {
        positive: number;
        neutral: number;
        critical: number;
    };
}
