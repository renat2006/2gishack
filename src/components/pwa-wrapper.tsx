'use client';

import { InstallPrompt } from './install-prompt';
import { NetworkStatus } from './network-status';
import { UpdatePrompt } from './update-prompt';

export function PWAWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NetworkStatus />
      <UpdatePrompt />
      <InstallPrompt />
      {children}
    </>
  );
}


