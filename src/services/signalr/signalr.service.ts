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
      
      // Join chat exactly like HTML test and backend ChatHub
      try {
        // Get user info from localStorage 
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const userName = user.fullname || user.username || user.email || 'Unknown User';
          const userRole = user.roleName || user.role || 'Member';
          
          console.log('🔗 Joining chat with backend ChatHub.JoinChat method:', {
            userId: userId,
            username: userName, 
            role: userRole
          });
          
          // Backend ChatHub.JoinChat expects: Guid userId, string username, string role
          await this.connection.invoke('JoinChat', userId, userName, userRole);
          console.log('✅ Successfully joined chat via JoinChat method');
          
        } else {
          console.warn('⚠️ No user info found in localStorage, joining with basic info');
          await this.connection.invoke('JoinChat', userId, 'Unknown User', 'Member');
        }
      } catch (joinError) {
        console.warn('⚠️ JoinChat failed, but connection is still active:', joinError);
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

    // Handle incoming messages exactly like HTML test - ALL possible event names
    this.connection.on("ReceiveMessage", (chatMessage) => {
      console.log('📨 SignalR message received via ReceiveMessage:', chatMessage);
      this.processReceivedMessage(chatMessage);
    });

    this.connection.on("MessageReceived", (chatMessage) => {
      console.log('📨 SignalR message received via MessageReceived:', chatMessage);
      this.processReceivedMessage(chatMessage);
    });

    this.connection.on("NewMessage", (chatMessage) => {
      console.log('📨 SignalR message received via NewMessage:', chatMessage);
      this.processReceivedMessage(chatMessage);
    });

    // Handle different parameter signatures
    this.connection.on("OnMessageReceived", (senderId, receiverId, message, timestamp) => {
      console.log('📨 OnMessageReceived:', { senderId, receiverId, message, timestamp });
      const chatMessage = {
        messageId: Date.now().toString(),
        senderId,
        receiverId,
        message,
        timestamp: timestamp || new Date().toISOString(),
        senderName: 'Unknown User',
        senderRole: 'Member',
        isRead: false
      };
      this.processReceivedMessage(chatMessage);
    });

    // Handle user joined (like HTML test)
    this.connection.on("UserJoined", (user) => {
      console.log(`👋 User ${user.username || user.userId} (${user.role}) joined chat`);
    });

    // Handle message history (like HTML test)
    this.connection.on("MessageHistory", (messages) => {
      console.log('📚 Message history received:', messages);
      if (Array.isArray(messages)) {
        messages.forEach(msg => this.processReceivedMessage(msg));
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

  private processReceivedMessage(chatMessage: any): void {
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
      console.log('📤 Sending message via SignalR using backend ChatHub.SendMessage:', { 
        message, 
        receiverId: receiverId,
        senderId: senderId || 'Unknown'
      });
      
      // Try Method 1: SendMessageDto object with proper GUID conversion
      try {
        const sendMessageDto = {
          SenderId: senderId, // Keep as string, C# will convert to Guid
          ReceiverId: receiverId, // Keep as string, C# will convert to Guid
          Message: message
        };
        
        console.log('📤 Trying SendMessage with SendMessageDto object:', sendMessageDto);
        await this.connection.invoke('SendMessage', sendMessageDto);
        console.log('✅ Message sent successfully via SendMessage(SendMessageDto)');
        return;
      } catch (error1) {
        console.warn('❌ SendMessage(object) failed:', error1);
      }
      
      // Try Method 2: Individual parameters (alternative approach)
      try {
        console.log('📤 Trying SendMessage with individual Guid parameters');
        await this.connection.invoke('SendMessage', senderId, receiverId, message);
        console.log('✅ Message sent successfully via SendMessage(Guid, Guid, string)');
        return;
      } catch (error2) {
        console.warn('❌ SendMessage(Guid params) failed:', error2);
      }
      
      throw new Error('All SendMessage methods failed');
      
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
