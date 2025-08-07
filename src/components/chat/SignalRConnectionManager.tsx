import React, { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { signalRService } from '../../services/signalr/signalr.service';

interface SignalRConnectionManagerProps {
  children: React.ReactNode;
  onMessageReceived?: (message: any) => void;
  onConnectionStateChanged?: (connected: boolean) => void;
}

const SignalRConnectionManager: React.FC<SignalRConnectionManagerProps> = ({
  children,
  onMessageReceived,
  onConnectionStateChanged
}) => {
  const { currentUser } = useAuth();
  const connectionRef = useRef<boolean>(false);

  // Stable callbacks using useRef
  const callbacksRef = useRef({
    onMessageReceived: onMessageReceived || (() => {}),
    onConnectionStateChanged: onConnectionStateChanged || (() => {})
  });

  // Update callbacks when they change
  useEffect(() => {
    callbacksRef.current = {
      onMessageReceived: onMessageReceived || (() => {}),
      onConnectionStateChanged: onConnectionStateChanged || (() => {})
    };
  }, [onMessageReceived, onConnectionStateChanged]);

  // Stable connection function
  const connectSignalR = useCallback(async () => {
    if (!currentUser?.accountid || connectionRef.current) {
      return;
    }

    try {
      connectionRef.current = true;
      console.log('🔗 Connecting to SignalR for user:', currentUser.accountid);
      
      await signalRService.initialize(currentUser.accountid, {
        onMessageReceived: (message) => callbacksRef.current.onMessageReceived(message),
        onConnectionStateChanged: (connected) => callbacksRef.current.onConnectionStateChanged(connected)
      });
      
      console.log('✅ SignalR connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to SignalR:', error);
      connectionRef.current = false;
    }
  }, [currentUser?.accountid]);

  // Stable disconnect function
  const disconnectSignalR = useCallback(() => {
    if (connectionRef.current) {
      console.log('🔌 Disconnecting SignalR');
      signalRService.disconnect();
      connectionRef.current = false;
    }
  }, []);

  // Connect/disconnect based on user
  useEffect(() => {
    if (currentUser?.accountid) {
      connectSignalR();
    } else {
      disconnectSignalR();
    }

    // Cleanup on unmount or user change
    return () => {
      disconnectSignalR();
    };
  }, [currentUser?.accountid, connectSignalR, disconnectSignalR]);

  return <>{children}</>;
};

export default SignalRConnectionManager;
