export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export interface ChatConversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface SendMessageDto {
  senderId: string; // Guid as string
  receiverId?: string; // Guid as string (nullable)
  message: string;
}

export interface MarkReadDto {
  messageIds: string[];
}

export interface OnlineUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastSeen: string;
}

export interface ChatError {
  message: string;
  code?: string;
}
