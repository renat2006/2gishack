'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import * as HoverCard from '@radix-ui/react-hover-card';
import { Buildings, MapPin, Globe } from '@phosphor-icons/react/dist/ssr';
import { ResidentialComplex } from '@/types';

export interface ComplexesModuleProps {
  items: ResidentialComplex[];
  entities?: string[];
}

export const ComplexesModule: React.FC<ComplexesModuleProps> = ({ items, entities }) => {
  const [isHoverable, setIsHoverable] = React.useState(false);

  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
        setIsHoverable(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsHoverable(e.matches);
        mq.addEventListener?.('change', handler);
        return () => mq.removeEventListener?.('change', handler);
      }
    } catch {}
  }, []);

  const handleCardClick = (complex: ResidentialComplex) => {
    if (typeof complex.lon === 'number' && typeof complex.lat === 'number') {
      window.dispatchEvent(
        new CustomEvent('map:focus-marker', {
          detail: {
            lon: complex.lon,
            lat: complex.lat,
            zoom: 16,
          },
        })
      );
    }
  };

  return (
    <div className="w-full space-y-2">
      {entities && entities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entities.map((ent, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded bg-primary-500 px-2 py-0.5 text-xs font-medium text-white"
            >
              {ent}
            </span>
          ))}
        </div>
      )}

      <Swiper
        modules={[EffectCoverflow, Pagination]}
        grabCursor
        centeredSlides
        effect="coverflow"
        coverflowEffect={{ rotate: 6, stretch: 0, depth: 100, modifier: 1, slideShadows: false }}
        spaceBetween={16}
        slidesPerView={1.05}
        breakpoints={{
          480: { slidesPerView: 1.2 },
          640: { slidesPerView: 1.6 },
          860: { slidesPerView: 2.2 },
          1024: { slidesPerView: 2.8 }
        }}
        className="px-1"
      >
        {items.map((complex, index) => (
          <SwiperSlide key={complex.id || index}>
            <motion.div
              className="relative"
              style={{ aspectRatio: '1' }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              {isHoverable ? (
                <HoverCard.Root openDelay={100} closeDelay={100}>
                  <HoverCard.Trigger asChild>
                    <div className="h-full cursor-pointer" onClick={() => handleCardClick(complex)}>
                      <Card className="relative h-full w-full rounded-lg border border-zinc-200 bg-white p-0 shadow-sm hover:shadow-md hover:border-primary-500 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-primary-500">
                        <div className="relative flex h-full flex-col items-center justify-center gap-2.5 p-4 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500 text-white">
                            <Buildings size={24} weight="fill" />
                          </div>
                          <div className="w-full space-y-1">
                            <div className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">{complex.name}</div>
                            {complex.address && (
                              <div className="line-clamp-2 text-xs leading-snug text-zinc-500 dark:text-zinc-400">{complex.address}</div>
                            )}
                            {complex.score !== undefined && (
                              <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-primary-500 px-2 py-0.5 text-xs font-medium text-white">
                                {complex.score.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </HoverCard.Trigger>
                  <HoverCard.Portal>
                    <HoverCard.Content
                      sideOffset={8}
                      className="z-50 w-64 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-primary-500 text-white">
                            <Buildings size={16} weight="fill" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-0.5 text-sm font-semibold text-zinc-900 dark:text-white">{complex.name}</div>
                            {complex.address && (
                              <div className="flex items-start gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                                <MapPin size={12} weight="fill" className="mt-0.5 flex-shrink-0" />
                                <span className="break-words">{complex.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {complex.website && (
                          <a
                            href={complex.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            <Globe size={12} weight="fill" />
                            <span>Сайт</span>
                          </a>
                        )}
                        {complex.distance !== undefined && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {(complex.distance / 1000).toFixed(2)} км
                          </div>
                        )}
                      </div>
                    </HoverCard.Content>
                  </HoverCard.Portal>
                </HoverCard.Root>
              ) : (
                <div className="h-full cursor-pointer" onClick={() => handleCardClick(complex)}>
                <Card className="relative h-full w-full rounded-lg border border-zinc-200 bg-white p-0 shadow-sm hover:shadow-md hover:border-primary-500 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-primary-500">
                  <div className="relative flex h-full flex-col items-center justify-center gap-2.5 p-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500 text-white">
                      <Buildings size={24} weight="fill" />
                    </div>
                    <div className="w-full space-y-1">
                      <div className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">{complex.name}</div>
                      {complex.address && (
                        <div className="line-clamp-2 text-xs leading-snug text-zinc-500 dark:text-zinc-400">{complex.address}</div>
                      )}
                      {complex.score !== undefined && (
                        <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-primary-500 px-2 py-0.5 text-xs font-medium text-white">
                          {complex.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                </div>
              )}
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

