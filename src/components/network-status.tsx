'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import '@/styles/network-status.css';

export function NetworkStatus() {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  if (isOnline && !isSlowConnection) {
    return null;
  }

  return (
    <div className={`network-status ${!isOnline ? 'offline' : 'slow'}`}>
      <div className="network-status-content">
        {!isOnline ? (
          <>
            <span className="network-status-icon">📡</span>
            <span className="network-status-text">Нет подключения к интернету</span>
          </>
        ) : (
          <>
            <span className="network-status-icon">🐌</span>
            <span className="network-status-text">Медленное соединение</span>
          </>
        )}
      </div>
    </div>
  );
}
