import React from 'react';
import ChatManagement from '../../components/chat/ChatManagement';

const ChatPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Chat Management
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Manage customer conversations and support requests
          </p>
        </div>
      </div>
      
      <ChatManagement />
    </div>
  );
};

export default ChatPage;
