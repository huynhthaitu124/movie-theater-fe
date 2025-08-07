// SignalR Configuration
export const SIGNALR_CONFIG = {
  HUB_URL: 'https://movie-theater-hfeafxgheubvdwfr.southeastasia-01.azurewebsites.net/chathub', // SignalR Hub URL từ backend
  RECONNECT_INTERVALS: [0, 2000, 10000, 30000], // Reconnection intervals in milliseconds
  MAX_RECONNECT_ATTEMPTS: 5
};


export default {
  SIGNALR_CONFIG
};
