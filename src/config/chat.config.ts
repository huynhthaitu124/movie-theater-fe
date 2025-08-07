// SignalR Configuration
export const SIGNALR_CONFIG = {
  HUB_URL: 'http://localhost:5250/chathub', // SignalR Hub URL từ backend
  RECONNECT_INTERVALS: [0, 2000, 10000, 30000], // Reconnection intervals in milliseconds
  MAX_RECONNECT_ATTEMPTS: 5
};

// Chat Configuration
export const CHAT_CONFIG = {
  // Admin/Staff user IDs - lấy từ backend
  ADMIN_USER_IDS: [
    '7e5b2214-d280-418b-8677-ff1b2a416ecf', // Lê Hoàng Phúc (Admin)
    'ad47c780-2611-45d9-a9d8-d980ba2ff5a3'  // Tu_TEST_2 (Admin)
  ],
  
  // Member user IDs - test users
  MEMBER_USER_IDS: [
    'e7a7c177-752a-4208-8b38-f107238cf715'  // TU_TEST_1 (Member)
  ],
  
  // Polling intervals (fallback when SignalR not available)
  MESSAGE_POLL_INTERVAL: 30000, // 30 seconds
  CONVERSATION_POLL_INTERVAL: 300000, // 5 minutes
  
  // Message limits
  MAX_MESSAGE_LENGTH: 1000,
  MAX_MESSAGES_PER_CONVERSATION: 1000
};

export default {
  SIGNALR_CONFIG,
  CHAT_CONFIG
};
