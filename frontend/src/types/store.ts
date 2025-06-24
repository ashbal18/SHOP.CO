// types/store.ts
export interface Store {
  id: string;
  name: string;
  address: string;
  adminId: string;
  city_id: string;
  latitude: number;
  longitude: number;
}

export interface StoreResponse {
  id: string;
  name: string;
  address: string;
  city?: {
    id: number;
    city_name: string;
    province_name: string;
  };
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}