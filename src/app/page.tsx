'use client';

import { Map2GIS } from '@/components/map';
import { ChatbotButton } from '@/components/chatbot-button';

export default function HomePage() {
  return (
    <main className="relative h-screen w-full bg-background text-foreground">
      <Map2GIS className="h-full w-full" />
      <ChatbotButton />
    </main>
  );
}
