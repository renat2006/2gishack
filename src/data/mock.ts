import { Place } from '@/types/place';

export const mockPlace: Place = {
  id: '70000001021028369',
  name: 'Парк Горького',
  purpose_name: 'Парк',
  address_name: 'Крымский Вал, 9',
  reviews: {
    count: 15200,
    average_rating: 9.2,
  },
  contacts: [
    {
      type: 'phone',
      value: '+74959950000',
      formatted_value: '+7 (495) 995-00-00',
    },
    {
      type: 'website',
      value: 'https://www.park-gorkogo.com/',
    },
  ],
  main_photo_url: 'https://i.ytimg.com/vi/G5_pqDCItr4/maxresdefault.jpg',
  schedule: {
    comment: 'Круглосуточно',
    is_open_now: true,
  },
};
