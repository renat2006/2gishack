import { Compass, Phone, Globe, Star, CheckCircle, Clock } from '@phosphor-icons/react/dist/ssr';
import { Separator } from '@/components/ui/separator';
import { Place } from '@/types/place';
import Image from 'next/image';

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const rating = Math.round((place.reviews.average_rating * 5) / 10);

  return (
    <aside className="sheet-content fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-lg border-t border-border bg-white/80 shadow-lg backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/80">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {place.main_photo_url && (
            <Image
              src={place.main_photo_url}
              alt={place.name}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          )}

          <div className="flex-1">
            <h1 className="text-xl font-bold">{place.name}</h1>
            <p className="text-sm text-muted-foreground">{place.purpose_name}</p>
            <div className="mt-1 flex items-center gap-1 text-sm">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} weight={i < rating ? 'fill' : 'regular'} />
                ))}
              </div>
              <span>{place.reviews.average_rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({place.reviews.count})</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-3">
            <Compass size={18} className="text-muted-foreground" weight="light" />
            <span className="flex-1">{place.address_name}</span>
          </div>

          {place.contacts.map(
            (contact) =>
              contact.type === 'phone' &&
              contact.value && (
                <div key={contact.value} className="flex items-center gap-3">
                  <Phone size={18} className="text-muted-foreground" weight="light" />
                  <a
                    href={`tel:${contact.value}`}
                    className="flex-1 transition-colors hover:text-primary-500"
                  >
                    {contact.formatted_value}
                  </a>
                </div>
              )
          )}

          {place.contacts.map(
            (contact) =>
              contact.type === 'website' &&
              contact.value && (
                <div key={contact.value} className="flex items-center gap-3">
                  <Globe size={18} className="text-muted-foreground" weight="light" />
                  <a
                    href={contact.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate transition-colors hover:text-primary-500"
                  >
                    {contact.value}
                  </a>
                </div>
              )
          )}
        </div>

        {place.schedule && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center gap-3 text-sm">
              <Clock size={18} className="text-muted-foreground" weight="light" />
              <span className="flex-1">{place.schedule.comment}</span>
              {place.schedule.is_open_now ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  <CheckCircle size={12} weight="fill" />
                  Открыто
                </span>
              ) : (
                <span className="text-xs text-red-500">Закрыто</span>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
