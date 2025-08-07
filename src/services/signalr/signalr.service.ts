import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { ChatMessage } from '../../types/chat';
import { SIGNALR_CONFIG } from '../../config/chat.config';

interface SignalRCallbacks {
  onMessageReceived?: (message: ChatMessage) => void;
  onConnectionStateChanged?: (connected: boolean) => void;
  onError?: (error: Error) => void;
}

export class SignalRService {
  private connection: HubConnection | null = null;
  private callbacks: SignalRCallbacks | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async initialize(userId: string, callbacks: SignalRCallbacks): Promise<void> {
    if (this.isConnecting) {
      console.log('SignalR connection already in progress...');
      return;
    }

    if (this.connection?.state === 'Connected') {
      console.log('SignalR already connected');
      return;
    }

    this.isConnecting = true;
    this.callbacks = callbacks;

    try {
      console.log('Initializing SignalR connection for user:', userId);
      
      // Create connection exactly like HTML test
      this.connection = new HubConnectionBuilder()
        .withUrl(`${SIGNALR_CONFIG.HUB_URL}`)
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Start connection
      await this.connection.start();
      console.log('🔗 SignalR connection established');
      
      // Join chat like HTML test - use JoinChat instead of JoinUserGroup
      try {
        // Get user info from localStorage 
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const userName = user.fullname || user.email || 'Unknown User';
          const userRole = user.role || 'Member';
          
          await this.connection.invoke("JoinChat", userId, userName, userRole);
          console.log(`✅ Successfully joined chat as ${userName} (${userRole})`);
        } else {
          console.warn('No user info found in localStorage');
        }
      } catch (joinError) {
        console.warn('JoinChat method not found, continuing without join:', joinError);
      }

      this.callbacks?.onConnectionStateChanged?.(true);
      this.reconnectAttempts = 0;

    } catch (error) {
      console.error('SignalR connection failed:', error);
      this.callbacks?.onError?.(error as Error);
      this.callbacks?.onConnectionStateChanged?.(false);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Handle incoming messages exactly like HTML test
    this.connection.on("ReceiveMessage", (chatMessage) => {
      console.log('📨 SignalR message received via ReceiveMessage:', chatMessage);
      
      // Map the received message to our ChatMessage format
      const mappedMessage: ChatMessage = {
        messageId: chatMessage.messageId || Date.now().toString(),
        senderId: chatMessage.senderId,
        senderName: chatMessage.senderName || 'Unknown User',
        senderRole: chatMessage.senderRole || 'Member',
        receiverId: chatMessage.receiverId,
        message: chatMessage.message,
        timestamp: chatMessage.timestamp || new Date().toISOString(),
        isRead: chatMessage.isRead || false
      };
      
      this.callbacks?.onMessageReceived?.(mappedMessage);
    });

    // Handle user joined (like HTML test)
    this.connection.on("UserJoined", (user) => {
      console.log(`👋 User ${user.username} (${user.role}) joined chat`);
    });

    // Handle message history (like HTML test)
    this.connection.on("MessageHistory", (messages) => {
      console.log('📚 Message history received:', messages);
      if (Array.isArray(messages)) {
        messages.forEach(msg => {
          const mappedMessage: ChatMessage = {
            messageId: msg.messageId || Date.now().toString(),
            senderId: msg.senderId,
            senderName: msg.senderName || 'Unknown User',
            senderRole: msg.senderRole || 'Member', 
            receiverId: msg.receiverId,
            message: msg.message,
            timestamp: msg.timestamp || new Date().toISOString(),
            isRead: msg.isRead || false
          };
          this.callbacks?.onMessageReceived?.(mappedMessage);
        });
      }
    });

    // Handle connection closed
    this.connection.onclose((error) => {
      console.log('🔴 SignalR connection closed:', error);
      this.callbacks?.onConnectionStateChanged?.(false);
      
      if (error && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    });

    // Handle reconnecting
    this.connection.onreconnecting((error) => {
      console.log('🔄 SignalR reconnecting:', error);
      this.callbacks?.onConnectionStateChanged?.(false);
    });

    // Handle reconnected
    this.connection.onreconnected((connectionId) => {
      console.log('🟢 SignalR reconnected:', connectionId);
      this.callbacks?.onConnectionStateChanged?.(true);
      this.reconnectAttempts = 0;
    });
  }

  private async attemptReconnect(): Promise<void> {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        if (this.connection?.state === 'Disconnected') {
          await this.connection.start();
          console.log('SignalR reconnected successfully');
          this.callbacks?.onConnectionStateChanged?.(true);
          this.reconnectAttempts = 0;
        }
      } catch (error) {
        console.error('SignalR reconnection failed:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      }
    }, delay);
  }

  async sendMessage(message: string, receiverId: string, senderId?: string, senderName?: string, senderRole?: string): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      throw new Error('SignalR not connected');
    }

    try {
      console.log('📤 Sending message via SignalR:', { 
        message, 
        receiverId, 
        senderId: senderId || 'Unknown',
        senderName: senderName || 'Unknown User',
        senderRole: senderRole || 'Member'
      });
      
      // Send message exactly like HTML test - pass all parameters
      await this.connection.invoke('SendMessage', 
        senderId || 'Unknown', 
        receiverId, 
        message, 
        senderName || 'Unknown User', 
        senderRole || 'Member'
      );
      console.log('✅ Message sent successfully via SignalR');
      
    } catch (error) {
      console.error('❌ Error sending message via SignalR:', error);
      throw error;
    }
  }

  async getChatHistory(userId1: string, userId2: string): Promise<ChatMessage[]> {
    if (!this.connection || this.connection.state !== 'Connected') {
      throw new Error('SignalR not connected');
    }

    try {
      console.log('Getting chat history via SignalR:', { userId1, userId2 });
      const messages = await this.connection.invoke('GetChatHistory', userId1, userId2);
      return messages || [];
    } catch (error) {
      console.error('Error getting chat history via SignalR:', error);
      throw error;
    }
  }

  async markMessagesAsRead(senderId: string): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      throw new Error('SignalR not connected');
    }

    try {
      await this.connection.invoke('MarkMessagesAsRead', senderId);
    } catch (error) {
      console.error('Error marking messages as read via SignalR:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR disconnected successfully');
      } catch (error) {
        console.error('Error disconnecting SignalR:', error);
      }
      this.connection = null;
    }
    this.callbacks = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }

  getConnectionState(): string {
    return this.connection?.state || 'Disconnected';
  }
}

export const signalRService = new SignalRService();
