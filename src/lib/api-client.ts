const BASE_URL = 'https://3gis.duckdns.org';

export interface ChatRequest {
  message: string;
  dialog_id?: string | null;
  user_location?: [number, number] | null;
  max_distance?: number;
  auto_rank?: boolean;
}

export interface ChatResponse {
  dialog_id: string;
  response: string;
  entities: string[];
  ranked_complexes: Array<Record<string, any>>;
  total_complexes: number;
}

export interface CreateDialogResponse {
  dialog_id: string;
}

export interface WebSearchRequest {
  query: string;
  lon?: number;
  lat?: number;
}

export interface AddressInfo {
  name: string;
  address: string;
}

export interface RouteInfo {
  success: boolean;
  route?: Record<string, any> | null;
}

export interface WebSearchResponse {
  success: boolean;
  message: string;
  entities: string[];
  search_queries: string[];
  search_results_count: number;
  addresses: AddressInfo[];
  route?: RouteInfo | null;
}

export interface QueryClass {
  query_class: 'search_residential_complex' | 'build_route' | 'general_question';
}

export interface RegionInfo {
  city?: string;
  region?: string;
  country?: string;
}

export interface LocationRequest {
  lon: number;
  lat: number;
}

export interface SearchEntity {
  name: string;
  address?: string;
  lon: number;
  lat: number;
}

export interface RankRequest {
  entities: string[];
  user_location?: [number, number] | null;
  max_distance?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async createDialog(): Promise<CreateDialogResponse> {
    const res = await fetch(`${this.baseUrl}/api/chat/dialog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${this.baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getDialogHistory(dialogId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/chat/dialog/${dialogId}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async deleteDialog(dialogId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/chat/dialog/${dialogId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async webSearch(request: WebSearchRequest): Promise<WebSearchResponse> {
    const res = await fetch(`${this.baseUrl}/api/web/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async classifyQuery(query: string): Promise<QueryClass> {
    const res = await fetch(`${this.baseUrl}/api/classifier/location/region`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getRegionByCoordinates(req: LocationRequest): Promise<RegionInfo> {
    const res = await fetch(`${this.baseUrl}/api/search/location/region`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async searchEntitiesInCity(params: {
    query: string;
    city?: string;
    user_lon?: number | null;
    user_lat?: number | null;
  }): Promise<SearchEntity[]> {
    const url = new URL(`${this.baseUrl}/api/search/entities/city`);
    url.searchParams.set('query', params.query);
    if (params.city) url.searchParams.set('city', String(params.city));
    if (typeof params.user_lon === 'number') url.searchParams.set('user_lon', String(params.user_lon));
    if (typeof params.user_lat === 'number') url.searchParams.set('user_lat', String(params.user_lat));
    const res = await fetch(url.toString(), { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async rankResidentialComplexes(req: RankRequest): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/api/search/rank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export const apiClient = new ApiClient();

