import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChatMessage } from '../../types/chat';

const ChatIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    sendMessage, 
    loadConversationMessages,
    unreadCount, 
    error, 
    clearError,
    isConnected 
  } = useChat();
  const { currentUser } = useAuth();

  // Chỉ hiển thị cho member
  if (currentUser?.role !== 'Member') {
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    setIsSending(true);
    clearError(); // Clear any previous errors

    try {
      // Sử dụng admin ID mới nhất để nhắn với support team
      const supportAdminId = 'ad47c780-2611-45d9-a9d8-d980ba2ff5a3'; // Tu_TEST_2 (Admin)
      
      console.log('Sending message to support admin:', supportAdminId);
      const res = await sendMessage(messageInput, supportAdminId);
      console.log('Message sent successfully to admin:', res);
      setMessageInput('');
    } catch (error: any) {
      console.error('Error sending message to admin:', error);
      // Error đã được xử lý trong context
    } finally {
      setIsSending(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      // Load conversation when opening chat
      if (currentUser?.accountid) {
        const supportAdminId = 'ad47c780-2611-45d9-a9d8-d980ba2ff5a3'; // Tu_TEST_2 (Admin)
        console.log('🔄 Loading conversation between member and admin:', currentUser.accountid, '<=>', supportAdminId);
        loadConversationMessages(currentUser.accountid, supportAdminId);
      }
    }
  };

  // Load conversation when user changes
  useEffect(() => {
    if (currentUser?.accountid && isOpen) {
      const supportAdminId = 'ad47c780-2611-45d9-a9d8-d980ba2ff5a3'; // Tu_TEST_2 (Admin)
      console.log('👤 User changed, loading conversation:', currentUser.accountid, '<=>', supportAdminId);
      loadConversationMessages(currentUser.accountid, supportAdminId);
    }
  }, [currentUser?.accountid, loadConversationMessages]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Icon Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, x: 50, y: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, x: 50, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed bottom-6 right-6 z-50 w-80 bg-white dark:bg-secondary-800 rounded-lg shadow-xl border border-secondary-200 dark:border-secondary-700 ${
              isMinimized ? 'h-12' : 'h-96'
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold text-secondary-900 dark:text-white">Support Chat</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMinimize}
                  className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded text-secondary-600 dark:text-secondary-400"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded text-secondary-600 dark:text-secondary-400"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <div className="flex flex-col h-80">
                {/* Error Display */}
                {error && (
                  <div className="p-3 mx-4 mt-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                      <p className="text-sm text-red-800 dark:text-red-200">{error.message}</p>
                      <button
                        onClick={clearError}
                        className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center text-secondary-500 dark:text-secondary-400 mt-8">
                      <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Start a conversation with our support team</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <motion.div
                          key={message.messageId || `${message.senderId}-${message.timestamp}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            message.senderId === currentUser?.accountid ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              message.senderId === currentUser?.accountid
                                ? 'bg-primary-600 text-white'
                                : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-white'
                            }`}
                          >
                            <p>{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === currentUser?.accountid
                                ? 'text-primary-200'
                                : 'text-secondary-500 dark:text-secondary-400'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {/* Auto scroll anchor */}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isSending}
                      className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white text-sm disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || isSending}
                      className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatIcon;
