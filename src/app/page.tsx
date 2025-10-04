import { TwoGisCardExample } from '@/components/examples/2gis-card-example';

export default function HomePage() {
  return (
    <main className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-primary-500">2GIS Hackathon PWA</h1>
        <p className="text-gray-600">Progressive Web Application с компонентами в стиле 2GIS</p>
      </div>
      <TwoGisCardExample />
    </main>
  );
}
