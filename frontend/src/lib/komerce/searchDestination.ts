// src/lib/komerce/searchDestination.ts

import axios from "axios";

export type Destination = {
  province_id: string;
  province_name: string;
  city_id: string;
  city_name: string;
  type: "Kota" | "Kabupaten";
};

export const searchDestination = async (
  keyword: string
): Promise<Destination[]> => {
  try {
    const response = await axios.get(
      `https://api-sandbox.collaborator.komerce.id/tariff/api/v1/destination/search`,
      {
        params: { keyword },
        headers: {
          // Authorization: `Bearer YOUR_TOKEN` // kalau dibutuhkan
        },
      }
    );

    return response.data.data as Destination[];
  } catch (error: any) {
    console.error("❌ Gagal mengambil data destinasi:", error.message);
    return [];
  }
};
