export interface TransportRoute {
  type: 'bus' | 'tram' | 'metro' | 'trolleybus';
  number: string;
  name: string;
  walkTime: number;
  color: string;
}

export interface PlaceAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export interface PlaceCardProps {
  title: string;
  subtitle: string;
  actions?: PlaceAction[];
  routes?: TransportRoute[];
  className?: string;
}

export interface PlaceContact {
  type: string;
  value: string;
  formatted_value?: string;
}

export interface Place {
  id: string;
  name: string;
  purpose_name: string;
  address_name: string;
  main_photo_url?: string;
  reviews: {
    average_rating: number;
    count: number;
  };
  contacts: PlaceContact[];
  schedule?: {
    working_hours?: Array<{
      day: string;
      from?: string;
      to?: string;
    }>;
    comment?: string;
    is_open_now?: boolean;
  };
}
