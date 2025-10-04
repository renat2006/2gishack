export default function OfflinePage() {
  return (
    <main className="main-container offline-container">
      <div className="offline-content">
        <div className="offline-icon">📡</div>
        <h1 className="offline-title">Вы оффлайн</h1>
        <p className="offline-description">
          Проверьте подключение к интернету и попробуйте снова
        </p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Повторить попытку
        </button>
      </div>
    </main>
  );
}


