import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MessageCircle, Send, Search, Users, MoreVertical, AlertCircle, X, RefreshCw } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { chatService } from '../../services/modules/chat.service';

interface Conversation {
  id: string;
  userId: string; // Target user to send messages to
  userName: string;
  userRole?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  // Current user info
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: string;
  // Conversation participants for message filtering
  user1Id: string;
  user2Id: string;
  messageCount?: number;
  conversationType?: string;
}

const ChatManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentUser } = useAuth();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages,
    loadConversationMessages,
    clearError,
    isConnected
  } = useChat();

  // Real conversations from API
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Fetch conversations from API - memoized to prevent infinite loops
  const fetchConversations = useCallback(async () => {
    try {
      console.log('Fetching conversations from API...');
      
      const response = await chatService.getConversations();
      console.log('Conversations response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Processed conversations:', response.data);
        setConversations(response.data);
      } else {
        console.warn('No conversations data received');
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  }, []);

  // Load conversations on component mount and setup auto-refresh
  useEffect(() => {
    fetchConversations();
    
    // Refresh conversations every 5 minutes (just for safety)
    const interval = setInterval(fetchConversations, 300000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Select first conversation by default and load its messages
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      const firstConv = conversations[0];
      console.log('Auto-selecting first conversation:', firstConv);
      setSelectedConversation(firstConv);
      
      // Load messages for first conversation using user1Id and user2Id
      if (firstConv.user1Id && firstConv.user2Id) {
        console.log('Loading messages for auto-selected conversation:', firstConv.user1Id, firstConv.user2Id);
        loadConversationMessages(firstConv.user1Id, firstConv.user2Id).catch(error => {
          console.error('Failed to auto-load conversation messages:', error);
        });
      } else {
        console.warn('First conversation missing user IDs:', firstConv);
      }
    }
  }, [conversations, selectedConversation]);

  // Listen for real-time messages to update conversation list
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;
    
    console.log('📨 Real-time message detected, updating conversation list:', latestMessage);
    
    // Update the conversation list with the new message
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => {
        // Check if this message belongs to this conversation
        const isFromThisConversation = 
          (conv.user1Id === latestMessage.senderId && conv.user2Id === latestMessage.receiverId) ||
          (conv.user1Id === latestMessage.receiverId && conv.user2Id === latestMessage.senderId) ||
          (conv.userId === latestMessage.senderId) ||
          (conv.userId === latestMessage.receiverId);
        
        if (isFromThisConversation) {
          console.log('✅ Updating conversation with new message:', conv.userName);
          return {
            ...conv,
            lastMessage: latestMessage.message,
            lastMessageTime: latestMessage.timestamp,
            // Increment unread count if message is not from current user and not in selected conversation
            unreadCount: (latestMessage.senderId !== currentUser?.accountid && 
                         selectedConversation?.id !== conv.id) 
                         ? conv.unreadCount + 1 
                         : conv.unreadCount
          };
        }
        
        return conv;
      });
      
      // Sort conversations by last message time (newest first)
      return updatedConversations.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    });
  }, [messages, currentUser?.accountid, selectedConversation?.id]);

  // Handle conversation selection - memoized to prevent re-renders
  const handleConversationSelect = useCallback(async (conversation: Conversation) => {
    console.log('Selecting conversation:', conversation);
    setSelectedConversation(conversation);
    
    // Reset unread count for selected conversation
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
    
    // Load messages for selected conversation using user1Id and user2Id
    if (conversation.user1Id && conversation.user2Id) {
      console.log('Loading messages for selected conversation:', conversation.user1Id, conversation.user2Id);
      try {
        await loadConversationMessages(conversation.user1Id, conversation.user2Id);
        // Small delay to ensure messages are rendered before scrolling
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } catch (error) {
        console.error('Failed to load conversation messages:', error);
      }
    } else {
      console.error('Selected conversation missing user IDs:', conversation);
    }
  }, [loadConversationMessages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending || !selectedConversation) return;

    setIsSending(true);
    clearError();

    try {
      console.log('Sending message to userId:', selectedConversation.userId);
      await sendMessage(messageInput, selectedConversation.userId);
      setMessageInput('');
      
      // No need to reload messages manually as SignalR will handle real-time updates
      // But for safety, we can still reload if SignalR is not connected
      if (!isConnected) {
        console.log('SignalR not connected, reloading messages manually');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (selectedConversation.user1Id && selectedConversation.user2Id) {
          await loadConversationMessages(selectedConversation.user1Id, selectedConversation.user2Id);
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Error is handled by context
    } finally {
      setIsSending(false);
    }
  }, [messageInput, isSending, selectedConversation, clearError, sendMessage, isConnected, loadConversationMessages]);

  // Safe filter with null check - memoized to prevent re-computation
  const filteredConversations = useMemo(() => 
    conversations.filter(conversation => 
      conversation && 
      conversation.userName && 
      conversation.userName.toLowerCase().includes(searchQuery.toLowerCase())
    ), [conversations, searchQuery]
  );

  // Only show for admin/staff
  if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Staff') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="mx-auto h-16 w-16 text-secondary-400 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
            Access Restricted
          </h3>
          <p className="text-secondary-500 dark:text-secondary-400">
            This feature is only available for admin and staff members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-16">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm shadow-2xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Customer Support Chat
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-300">
                  {isConnected ? 'Real-time Connected' : 'Disconnected'}
                </span>
              </div>
              
              <button
                onClick={() => refreshMessages(selectedConversation?.userId)}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-600 text-white rounded-lg transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Chat Management</h2>
            <p className="text-gray-400 mt-1">
              Manage customer conversations and support requests
            </p>
          </div>
        </div>

        <div className="bg-secondary-800 rounded-lg shadow-lg border border-secondary-700 overflow-hidden">
          {/* Main Chat Content */}
          <div className="flex h-[600px]">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 border-r border-secondary-700 flex flex-col bg-secondary-900">
          {/* Search */}
          <div className="p-4 border-b border-secondary-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-secondary-700 text-white text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-secondary-400 mb-2" />
                <p className="text-secondary-400 text-sm">No conversations found</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-700">
                {filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-primary-900/20 border-r-2 border-primary-500'
                        : 'hover:bg-secondary-800'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs">
                            {conversation.userName ? conversation.userName.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-secondary-800"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white truncate">
                            {conversation.userName || 'Unknown User'}
                          </h4>
                          <span className="text-xs text-secondary-400 ml-2">
                            {conversation.lastMessageTime || ''}
                          </span>
                        </div>
                        <p className="text-xs text-secondary-300 truncate mt-1">
                          {conversation.lastMessage || 'No messages'}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {conversation.unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-secondary-700 bg-secondary-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {selectedConversation.userName ? selectedConversation.userName.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      {selectedConversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-secondary-800"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {selectedConversation.userName || 'Unknown User'}
                      </h3>
                      <p className="text-xs text-secondary-400">
                        {selectedConversation.isOnline ? 'Online' : 'Offline'}
                        {selectedConversation.userRole && ` • ${selectedConversation.userRole}`}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-secondary-700 rounded">
                    <MoreVertical className="w-4 h-4 text-secondary-500" />
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 mx-4 mt-4 bg-red-900/20 border border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-red-400" />
                    <p className="text-sm text-red-200">{error.message}</p>
                    <button
                      onClick={clearError}
                      className="ml-auto text-red-400 hover:text-red-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-secondary-900">
                {isLoading && messages.length === 0 ? (
                  <div className="text-center text-secondary-400 mt-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-sm">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-secondary-400 mt-8">
                    <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-sm font-medium mb-2">No messages yet</h3>
                    <p className="text-xs">Start the conversation with {selectedConversation.userName || 'this user'}!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.messageId || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.senderId === currentUser?.accountid ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className="flex flex-col max-w-xs lg:max-w-md">
                          {/* Sender info */}
                          {message.senderId !== currentUser?.accountid && (
                            <span className="text-xs text-secondary-400 mb-1 ml-1">
                              {message.senderName || selectedConversation.userName}
                            </span>
                          )}
                          <div
                            className={`px-3 py-2 rounded-lg text-sm ${
                              message.senderId === currentUser?.accountid
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-secondary-700 text-white border border-secondary-600 rounded-bl-sm'
                            }`}
                          >
                            <p className="break-words">{message.message}</p>
                            <div className="flex justify-end mt-1">
                              <span className={`text-xs opacity-75 ${
                                message.senderId === currentUser?.accountid 
                                  ? 'text-primary-200' 
                                  : 'text-secondary-400'
                              }`}>
                                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Now'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-secondary-700 bg-secondary-800">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${selectedConversation.userName || 'user'}...`}
                    disabled={isSending}
                    className="flex-1 px-3 py-2 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-secondary-700 text-white disabled:opacity-50 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || isSending}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send size={14} />
                    )}
                    <span>{isSending ? 'Sending...' : 'Send'}</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-secondary-900">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                <h3 className="text-sm font-medium text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-xs text-secondary-400">
                  Choose a conversation from the sidebar to start chatting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export { ChatManagement as default };
