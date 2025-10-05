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
import { MapPin } from '@phosphor-icons/react/dist/ssr';
import { DgisLiteItem } from '@/types';

export interface PlacesModuleProps {
  items?: DgisLiteItem[];
  loading?: boolean;
}

const SKELETON_COUNT = 6;

export const PlacesModule: React.FC<PlacesModuleProps> = ({ items, loading }) => {
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

  const isLoaded = !!items && !loading && items.length > 0;
  const length = isLoaded ? items.length : SKELETON_COUNT;

  return (
    <div className="w-full">
      <Swiper
        modules={[EffectCoverflow, Pagination]}
        grabCursor
        centeredSlides
        effect="coverflow"
        coverflowEffect={{ rotate: 6, stretch: 0, depth: 100, modifier: 1, slideShadows: false }}
        spaceBetween={8}
        slidesPerView={1.4}
        breakpoints={{
          480: { slidesPerView: 1.6 },
          640: { slidesPerView: 2.0 },
          860: { slidesPerView: 2.8 },
          1024: { slidesPerView: 3.6 },
        }}
        className="px-1"
      >
        {Array.from({ length }).map((_, index) => {
          const it = isLoaded ? items![index] : null;
          return (
            <SwiperSlide key={`place-${index}`}>
              <motion.div
                className="relative"
                style={{ aspectRatio: '1' }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                {!isLoaded ? (
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                      <motion.div
                        className="h-12 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-700"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                      <motion.div
                        className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 }}
                      />
                      <motion.div
                        className="h-2.5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ) : isHoverable ? (
                  <HoverCard.Root openDelay={100} closeDelay={100}>
                    <HoverCard.Trigger asChild>
                      <div className="h-full">
                        <Card className="relative h-full w-full rounded-lg border border-zinc-200/50 bg-white/90 backdrop-blur-sm p-0 shadow-sm hover:shadow-md transition-all duration-200 dark:border-zinc-700/50 dark:bg-zinc-800/90">
                          <div className="relative flex h-full flex-col items-center justify-center gap-1.5 p-2 text-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm">
                              <MapPin size={12} weight="fill" />
                            </div>
                            <div className="w-full space-y-0.5">
                              <div className="line-clamp-2 text-[11px] font-semibold leading-tight text-zinc-900 dark:text-white">
                                {it!.name}
                              </div>
                              {it!.address_name && (
                                <div className="line-clamp-1 text-[9px] leading-tight text-zinc-500 dark:text-zinc-400">
                                  {it!.address_name}
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
                        <div className="flex items-start gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-primary-500 text-white">
                            <MapPin size={16} weight="fill" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
                              {it!.name}
                            </div>
                            {it!.address_name && (
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 break-words">
                                {it!.address_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </HoverCard.Content>
                    </HoverCard.Portal>
                  </HoverCard.Root>
                ) : (
                  <Card className="relative h-full w-full rounded-lg border border-zinc-200/50 bg-white/90 backdrop-blur-sm p-0 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800/90">
                    <div className="relative flex h-full flex-col items-center justify-center gap-1.5 p-2 text-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm">
                        <MapPin size={12} weight="fill" />
                      </div>
                      <div className="w-full space-y-0.5">
                        <div className="line-clamp-2 text-[11px] font-semibold leading-tight text-zinc-900 dark:text-white">
                          {it!.name}
                        </div>
                        {it!.address_name && (
                          <div className="line-clamp-1 text-[9px] leading-tight text-zinc-500 dark:text-zinc-400">
                            {it!.address_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};
