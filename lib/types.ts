export type Role = 'system' | 'user' | 'assistant';

export interface ChatMessage {
	id: string;
	role: Role;
	content: string;
	createdAt: number;
}

export interface ChatRequestBody {
	messages: Array<Pick<ChatMessage, 'role' | 'content'>>;
}