export type ChatRole = 'user' | 'assistant';

export interface DgisLiteItem {
  id: string;
  name: string;
  address_name?: string;
}

export interface ResidentialComplex {
  id?: string;
  name: string;
  address: string;
  website?: string;
  lon: number;
  lat: number;
  score?: number;
  distance?: number;
}

export interface PlacesModule {
  type: 'places';
  items: DgisLiteItem[];
  loading?: boolean;
}

export interface ComplexesModule {
  type: 'complexes';
  items: ResidentialComplex[];
  entities?: string[];
}

export type ModuleBlock = PlacesModule | ComplexesModule;

export interface ChatMessage {
  id: string;
  role: ChatRole;
  kind: 'text' | 'module';
  text?: string;
  module?: ModuleBlock;
}
