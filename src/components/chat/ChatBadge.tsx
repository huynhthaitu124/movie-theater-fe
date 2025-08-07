import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

const ChatBadge: React.FC = () => {
  const { currentUser } = useAuth();
  const { unreadCount } = useChat();

  // Chỉ hiển thị cho Admin/Staff
  if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Staff') {
    return null;
  }

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ml-auto">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};

export default ChatBadge;
