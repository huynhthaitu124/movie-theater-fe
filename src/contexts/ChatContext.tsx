import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChatMessage, ChatError } from '../types/chat';
import { chatService } from '../services/modules/chat.service';
import { signalRService } from '../services/signalr/signalr.service';
import { useAuth } from './AuthContext';

interface ChatContextType {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  error: ChatError | null;
  unreadCount: number;
  isConnected: boolean;

  // Actions
  sendMessage: (message: string, receiverId?: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  loadConversationMessages: (user1Id: string, user2Id: string) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string>(''); // Track current conversation

  const { currentUser } = useAuth();

  // Chat history persistence
  const CHAT_STORAGE_KEY = `chat_history_${currentUser?.accountid || 'anonymous'}`;
  
  const saveMessagesToStorage = useCallback((messages: ChatMessage[], conversationKey: string) => {
    try {
      const chatData = {
        messages,
        conversationKey,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`${CHAT_STORAGE_KEY}_${conversationKey}`, JSON.stringify(chatData));
      console.log('💾 Chat history saved to localStorage for conversation:', conversationKey);
    } catch (error) {
      console.warn('Failed to save chat history to localStorage:', error);
    }
  }, [CHAT_STORAGE_KEY]);

  const loadMessagesFromStorage = useCallback((conversationKey: string): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(`${CHAT_STORAGE_KEY}_${conversationKey}`);
      if (stored) {
        const chatData = JSON.parse(stored);
        console.log('📂 Chat history loaded from localStorage for conversation:', conversationKey);
        return Array.isArray(chatData.messages) ? chatData.messages : [];
      }
    } catch (error) {
      console.warn('Failed to load chat history from localStorage:', error);
    }
    return [];
  }, [CHAT_STORAGE_KEY]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // SignalR callbacks
  const signalRCallbacks = {
    onMessageReceived: (message: ChatMessage) => {
      console.log('📨 New message received via SignalR:', message);
      
      // Add the message to local state for real-time display
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const existingMessage = prev.find(m => 
          m.messageId === message.messageId || 
          (m.senderId === message.senderId && 
           m.receiverId === message.receiverId && 
           m.message === message.message && 
           Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000)
        );
        
        if (existingMessage) {
          console.log('Message already exists, skipping duplicate');
          return prev;
        }
        
        console.log('✅ Adding new message to local state');
        const newMessages = [...prev, message];
        
        // Save updated messages to localStorage
        if (currentConversation) {
          saveMessagesToStorage(newMessages, currentConversation);
        }
        
        return newMessages;
      });
      
      // Update unread count if the message is not from current user
      if (message.senderId !== currentUser?.accountid) {
        setUnreadCount(prev => prev + 1);
      }
    },
    onConnectionStateChanged: (connected: boolean) => {
      console.log('🔄 SignalR connection state changed:', connected);
      setIsConnected(connected);
      
      if (connected) {
        console.log('✅ SignalR connected - real-time chat active');
      } else {
        console.log('❌ SignalR disconnected - falling back to polling');
      }
    }
  };

  // Connect to SignalR when user is authenticated
  const connectSignalR = useCallback(async () => {
    if (currentUser?.accountid && !isConnected) {
      try {
        console.log('Connecting to SignalR for user:', currentUser.accountid);
        await signalRService.initialize(currentUser.accountid, signalRCallbacks);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to SignalR:', error);
        setIsConnected(false);
      }
    }
  }, [currentUser, isConnected]);

  // Load conversation messages between two users
  const loadConversationMessages = useCallback(async (user1Id: string, user2Id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📁 Loading conversation messages between:', user1Id, 'and', user2Id);
      
      // Create conversation key for storage
      const conversationKey = [user1Id, user2Id].sort().join('_');
      setCurrentConversation(conversationKey);
      
      // Load from localStorage first for immediate display
      const cachedMessages = loadMessagesFromStorage(conversationKey);
      if (cachedMessages.length > 0) {
        console.log('📂 Using cached messages while loading fresh data');
        setMessages(cachedMessages);
      }
      
      // Then load fresh data from API
      const response = await chatService.getChatHistoryBetweenUsers(user1Id, user2Id);
      console.log('🌐 Fresh conversation messages response:', response);
      
      if (Array.isArray(response.data)) {
        const validMessages = response.data.filter(msg => 
          msg && typeof msg === 'object' && msg.message && msg.senderId
        );
        console.log('✅ Valid conversation messages:', validMessages.length);
        
        setMessages(validMessages);
        
        // Save to localStorage
        saveMessagesToStorage(validMessages, conversationKey);
      } else {
        console.warn('⚠️ Invalid conversation messages format');
        setMessages(cachedMessages); // Keep cached if API fails
      }
      
    } catch (error: any) {
      console.error('❌ Error loading conversation messages:', error);
      setError({
        message: 'Failed to load conversation messages',
        code: 'LOAD_CONVERSATION_ERROR'
      });
      
      // Keep cached messages if API fails
      const conversationKey = [user1Id, user2Id].sort().join('_');
      const cachedMessages = loadMessagesFromStorage(conversationKey);
      setMessages(cachedMessages);
    } finally {
      setIsLoading(false);
    }
  }, [loadMessagesFromStorage, saveMessagesToStorage]);

  // Load chat messages (general, fallback method) 
  const refreshMessages = useCallback(async (userId?: string) => {
    if (!currentUser?.accountid) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Refreshing messages for user:', currentUser.accountid, 'with userId:', userId);
      
      if (!userId) {
        console.log('No userId provided for refreshMessages, skipping...');
        setMessages([]);
        return;
      }

      // Get chat history with specific userId
      const response = await chatService.getChatHistory(userId);
      console.log('General chat history response:', response);
      
      if (Array.isArray(response.data)) {
        const validMessages = response.data.filter(msg => 
          msg && typeof msg === 'object' && msg.message && msg.senderId
        );
        console.log('Valid messages:', validMessages);
        setMessages(validMessages);
      } else {
        console.warn('Invalid chat history format');
        setMessages([]);
      }
      
      // Get unread count
      try {
        const unreadResponse = await chatService.getUnreadMessages();
        console.log('Unread messages response:', unreadResponse);
        if (Array.isArray(unreadResponse.data)) {
          setUnreadCount(unreadResponse.data.length);
        }
      } catch (unreadError) {
        console.warn('Failed to get unread count:', unreadError);
        setUnreadCount(0);
      }
      
    } catch (error: any) {
      console.error('Error refreshing messages:', error);
      setError({
        message: 'Failed to refresh messages',
        code: 'REFRESH_MESSAGES_ERROR'
      });
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Send message
  const sendMessage = useCallback(async (message: string, receiverId?: string) => {
    if (!currentUser?.accountid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      // Try SignalR first if connected
      if (isConnected && receiverId) {
        try {
          console.log('📤 Sending message via SignalR to:', receiverId);
          
          // Send with correct GUID format senderId like backend expects
          await signalRService.sendMessage(
            message, 
            receiverId, // should be GUID format like 'ad47c780-2611-45d9-a9d8-d980ba2ff5a3'
            currentUser.accountid, // senderId - GUID format
            currentUser.name || currentUser.username || 'Admin User', // senderName
            currentUser.roleName || 'Admin' // senderRole
          );
          
          console.log('✅ Message sent via SignalR successfully');
          
          // Add message to local state immediately so sender can see their own message
          const sentMessage: ChatMessage = {
            messageId: Date.now().toString(),
            senderId: currentUser.accountid,
            senderName: currentUser.name || currentUser.username || 'Admin User',
            senderRole: currentUser.roleName || 'Admin',
            receiverId: receiverId,
            message: message,
            timestamp: new Date().toISOString(),
            isRead: false
          };
          
          setMessages(prev => {
            const updatedMessages = [...prev, sentMessage];
            
            // Save to localStorage
            if (currentConversation) {
              saveMessagesToStorage(updatedMessages, currentConversation);
            }
            
            return updatedMessages;
          });
          
          return; // SignalR sent successfully
        } catch (signalRError) {
          console.warn('⚠️ SignalR send failed, falling back to REST API:', signalRError);
        }
      }
      
      // Fallback to REST API
      console.log('📤 Sending message via REST API to:', receiverId);
      const newMessage = await chatService.sendMessage(message, receiverId);
      
      // Add message to local state immediately for better UX
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        
        // Save to localStorage
        if (currentConversation) {
          saveMessagesToStorage(updatedMessages, currentConversation);
        }
        
        return updatedMessages;
      });
      
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      setError({
        message: error.message || 'Failed to send message',
        code: 'SEND_MESSAGE_ERROR'
      });
      throw error; // Re-throw to let components handle it
    }
  }, [currentUser, isConnected]);

  // Initialize SignalR when user changes
  useEffect(() => {
    if (currentUser?.accountid) {
      connectSignalR();
      console.log('SignalR enabled for real-time chat');
    }
    
    return () => {
      if (isConnected) {
        signalRService.disconnect();
        setIsConnected(false);
      }
    };
  }, [currentUser, connectSignalR]);

  const value: ChatContextType = {
    messages,
    isLoading,
    error,
    unreadCount,
    isConnected,
    sendMessage,
    refreshMessages,
    loadConversationMessages,
    clearError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
