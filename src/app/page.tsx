export default function HomePage() {
  return (
    <main className="main-container">
      <div className="hero">
        <h1 className="title">2GIS Hack PWA</h1>
        <p className="subtitle">Progressive Web Application с оффлайн поддержкой</p>
      </div>

      <div className="features">
        <FeatureCard
          icon="⚡"
          title="Быстрая загрузка"
          description="Оптимизированная сборка и кэширование"
        />
        <FeatureCard
          icon="📱"
          title="Mobile-first"
          description="Адаптивный дизайн для всех устройств"
        />
        <FeatureCard icon="💾" title="Оффлайн режим" description="Работает без интернета" />
        <FeatureCard icon="🚀" title="PWA" description="Устанавливается как приложение" />
      </div>
    </main>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
}
