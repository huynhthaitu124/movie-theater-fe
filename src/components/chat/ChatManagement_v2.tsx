import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, AlertCircle, X, Users, Search } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ChatConversation } from '../../types/chat';

const ChatManagement: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentUser } = useAuth();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages,
    clearError
  } = useChat();

  // Mock conversations data - trong thực tế sẽ lấy từ API
  const [conversations] = useState<ChatConversation[]>([
    {
      userId: 'e7a7c177-752a-4208-8b38-f107238cf715',
      userName: 'TU_TEST_1',
      lastMessage: 'Test với user ID khác',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 2,
      isOnline: true
    },
    {
      userId: 'user2',
      userName: 'Nguyễn Văn A',
      lastMessage: 'Tôi muốn hủy vé đã đặt',
      lastMessageTime: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      unreadCount: 0,
      isOnline: false
    },
    {
      userId: 'user3',
      userName: 'Trần Thị B',
      lastMessage: 'Làm sao để đổi suất chiếu?',
      lastMessageTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      unreadCount: 1,
      isOnline: true
    }
  ]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages on component mount
  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  // Set default selected conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending || !selectedConversation) return;

    setIsSending(true);
    clearError();

    try {
      await sendMessage(messageInput, selectedConversation.userId);
      setMessageInput('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Error is handled by context
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Only show for admin/staff
  if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Staff') {
    return (
      <div className="flex items-center justify-center h-full">
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
    <div className="flex h-full bg-white dark:bg-secondary-800">
      {/* Left Panel - Conversations List */}
      <div className="w-1/3 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
        {/* Conversations Header */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
              Conversations
            </h2>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-secondary-500 dark:text-secondary-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.userId}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.userId === conversation.userId
                      ? 'bg-primary-100 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-700'
                      : 'hover:bg-secondary-50 dark:hover:bg-secondary-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <div className="w-8 h-8 bg-secondary-300 dark:bg-secondary-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-secondary-700 dark:text-secondary-300">
                            {conversation.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-secondary-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                          {conversation.userName}
                        </h4>
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 truncate">
                    {conversation.lastMessage}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                    {new Date(conversation.lastMessageTime).toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-secondary-300 dark:bg-secondary-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        {selectedConversation.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {selectedConversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-secondary-800"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                      {selectedConversation.userName}
                    </h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      {selectedConversation.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={refreshMessages}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white rounded-lg transition-colors"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 mx-4 mt-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                  <p className="text-red-800 dark:text-red-200">{error.message}</p>
                  <button
                    onClick={clearError}
                    className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isLoading && messages.length === 0 ? (
                <div className="text-center text-secondary-500 dark:text-secondary-400 mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-secondary-500 dark:text-secondary-400 mt-8">
                  <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                  <p>Start a conversation with {selectedConversation.userName}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id || message.messageId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.senderId === currentUser?.accountid ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.senderId === currentUser?.accountid
                            ? 'bg-primary-600 text-white'
                            : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <div className="flex justify-between items-center mt-2 text-xs opacity-75">
                          <span>
                            {message.senderName || (message.senderId === currentUser?.accountid ? 'You' : `User ${message.senderId.slice(0, 8)}`)}
                          </span>
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${selectedConversation.userName}...`}
                  disabled={isSending}
                  className="flex-1 px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || isSending}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={18} />
                  )}
                  <span>{isSending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-secondary-400" />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-secondary-500 dark:text-secondary-400">
                Choose a conversation from the left to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;
