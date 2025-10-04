'use client';

import { useServiceWorker } from '@/hooks/use-service-worker';
import '@/styles/update-prompt.css';

export function UpdatePrompt() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="update-prompt">
      <div className="update-prompt-content">
        <span className="update-prompt-icon">🔄</span>
        <span className="update-prompt-text">
          Доступна новая версия приложения
        </span>
      </div>
      <button 
        className="update-button"
        onClick={updateServiceWorker}
      >
        Обновить
      </button>
    </div>
  );
}


