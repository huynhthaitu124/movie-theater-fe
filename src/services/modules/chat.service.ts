import { axiosClient } from '../api/axiosClient';
import { ChatMessage, SendMessageDto, OnlineUser } from '../../types/chat';

export class ChatService {
  // Helper method để lấy user ID hiện tại từ localStorage hoặc context
  private getCurrentUserId(): string {
    // Lấy từ localStorage hoặc context
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.accountid || '';
    }
    throw new Error('User not authenticated');
  }

  async sendMessage(message: string, receiverId?: string): Promise<ChatMessage> {
    try {
      // Tạo SendMessageDto theo format backend yêu cầu
      const sendMessageDto: SendMessageDto = {
        senderId: this.getCurrentUserId(),
        receiverId: receiverId, // undefined thay vì null
        message: message.trim()
      };

      console.log('Sending message with DTO:', sendMessageDto);
      const response = await axiosClient.post('/api/Chat/send', sendMessageDto);
      console.log('Send message response:', response);
      
      // API trả về format: {status: 200, message: "Save data success", data: ChatMessage}
      const apiResponse = response.data;
      
      if (apiResponse?.data) {
        console.log('Message sent successfully:', apiResponse.data);
        return apiResponse.data; // Return the actual message data
      } else {
        console.error('Invalid send message response:', apiResponse);
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.response?.status === 400) {
        throw new Error('Invalid message format. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to send messages.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Failed to send message. Please check your connection.');
      }
    }
  }

  async getChatHistory(userId?: string): Promise<{ data: ChatMessage[] }> {
    try {
      if (!userId) {
        // Nếu không có userId, lấy current user từ localStorage
        const currentUserId = this.getCurrentUserId();
        console.log('No userId provided, using current user:', currentUserId);
        
        // Gọi API mà không có userId sẽ lỗi 404, cần userId
        console.warn('getChatHistory requires userId parameter');
        return { data: [] };
      }

      console.log('Calling getChatHistory with userId:', userId);
      
      const response = await axiosClient.get(`/api/Chat/history/${userId}`);
      console.log('Raw API response:', response);
      
      // API trả về format: {status: 200, message: "...", data: [...]}
      const apiResponse = response.data;
      
      if (apiResponse?.data && Array.isArray(apiResponse.data)) {
        console.log('Chat history data:', apiResponse.data);
        return { data: apiResponse.data };
      } else {
        console.warn('Invalid chat history response format:', apiResponse);
        return { data: [] };
      }
    } catch (error: any) {
      console.error('Error fetching chat history:', error);
      console.error('Error response:', error.response?.data);
      throw new Error('Failed to load chat history');
    }
  }

  async getUnreadMessages(): Promise<{ data: ChatMessage[] }> {
    try {
      const response = await axiosClient.get<ChatMessage[]>('/api/Chat/unread');
      return { data: response.data };
    } catch (error: any) {
      console.error('Error fetching unread messages:', error);
      throw new Error('Failed to load unread messages');
    }
  }

  async markMessagesAsRead(senderId: string): Promise<void> {
    try {
      await axiosClient.put('/api/Chat/markread', { senderId });
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      throw new Error('Failed to mark messages as read');
    }
  }

  async getOnlineUsers(): Promise<{ data: OnlineUser[] }> {
    try {
      const response = await axiosClient.get<OnlineUser[]>('/api/Chat/online');
      return { data: response.data };
    } catch (error: any) {
      console.error('Error fetching online users:', error);
      throw new Error('Failed to load online users');
    }
  }

  async getConversations(): Promise<{ data: any[] }> {
    try {
      console.log('Calling getConversations API...');
      const response = await axiosClient.get('/api/Chat/admin/conversations');
      console.log('Raw conversations response:', response);
      
      // API trả về format: {status: 200, message: "...", data: [...]}
      const apiResponse = response.data;
      
      if (apiResponse?.data && Array.isArray(apiResponse.data)) {
        // Map từ API response format sang format component cần - KHÔNG gọi API history ở đây
        const conversations = apiResponse.data.map((conv: any) => {
          return {
            id: `${conv.user1Id}-${conv.user2Id}`, // Tạo ID unique
            userId: conv.user2Id, // Target user để gửi tin nhắn
            userName: conv.user2Name,
            userRole: conv.user2Role,
            lastMessage: 'Click to view messages', // Placeholder text
            lastMessageTime: conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString() : '',
            unreadCount: conv.unreadCount || 0,
            isOnline: false, // Sẽ update từ online users API
            // Thông tin conversation participants
            user1Id: conv.user1Id,
            user2Id: conv.user2Id,
            user1Name: conv.user1Name,
            user1Role: conv.user1Role,
            user2Name: conv.user2Name,
            user2Role: conv.user2Role,
            conversationType: conv.conversationType,
            messageCount: conv.messageCount
          };
        });
        
        console.log('Mapped conversations:', conversations);
        return { data: conversations };
      } else {
        console.warn('Invalid API response format:', apiResponse);
        return { data: [] };
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      console.error('Error response:', error.response?.data);
      throw new Error('Failed to load conversations');
    }
  }

  async getChatHistoryBetweenUsers(user1Id: string, user2Id: string): Promise<{ data: ChatMessage[] }> {
    try {
      // Sử dụng endpoint history với userId của người kia
      const currentUserId = this.getCurrentUserId();
      const otherUserId = currentUserId === user1Id ? user2Id : user1Id;
      
      console.log('Getting chat history between:', user1Id, 'and', user2Id);
      console.log('Current user:', currentUserId, 'Other user:', otherUserId);
      
      const response = await axiosClient.get(`/api/Chat/history/${otherUserId}`);
      console.log('Chat history response:', response);
      
      // API trả về format: {status: 200, message: "Get data success", data: [...]}
      const apiResponse = response.data;
      
      if (apiResponse?.data && Array.isArray(apiResponse.data)) {
        // Filter messages để chỉ lấy messages giữa 2 users này
        const filteredMessages = apiResponse.data.filter((msg: any) => 
          (msg.senderId === user1Id && msg.receiverId === user2Id) ||
          (msg.senderId === user2Id && msg.receiverId === user1Id) ||
          (msg.senderId === user1Id && !msg.receiverId) ||
          (msg.senderId === user2Id && !msg.receiverId)
        );
        
        // Sort by timestamp
        const sortedMessages = filteredMessages.sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        console.log('Filtered and sorted messages:', sortedMessages);
        return { data: sortedMessages };
      } else {
        console.warn('Invalid chat history response format:', apiResponse);
        return { data: [] };
      }
    } catch (error: any) {
      console.error('Error fetching chat history between users:', error);
      console.error('Error response:', error.response?.data);
      throw new Error('Failed to load chat history');
    }
  }
}

export const chatService = new ChatService();
