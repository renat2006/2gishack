'use client';

import { useEffect, useState } from 'react';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import '@/styles/install-prompt.css';

export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">📱</div>
        <div className="install-prompt-text">
          <h3 className="install-prompt-title">Установить приложение</h3>
          <p className="install-prompt-description">
            Добавьте на главный экран для быстрого доступа
          </p>
        </div>
      </div>
      <div className="install-prompt-actions">
        <button 
          className="install-button-secondary"
          onClick={handleDismiss}
          aria-label="Закрыть"
        >
          Позже
        </button>
        <button 
          className="install-button-primary"
          onClick={promptInstall}
        >
          Установить
        </button>
      </div>
    </div>
  );
}


