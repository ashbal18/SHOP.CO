import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export class RajaOngkirController {
  /**
   * @route   GET /api/rajaongkir/search?keyword=padang
   * @desc    Search destination from Komerce API by keyword
   * @access  Public
   */
  async searchDestination(req: Request, res: Response): Promise<void> {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== "string") {
      res.status(400).json({
        success: false,
        message: "Query parameter 'keyword' is required and must be a string",
      });
      return;
    }

    const apiKey = process.env.API_KEY_RAJA_ONGKIR;
    if (!apiKey) {
      res.status(500).json({
        success: false,
        message: "Missing 'API_KEY_RAJA_ONGKIR' in environment variables",
      });
      return;
    }

    try {
      const response = await axios.get(
        "https://api-sandbox.collaborator.komerce.id/tariff/api/v1/destination/search",
        {
          headers: {
            "x-api-key": apiKey,
          },
          params: { keyword },
        }
      );

      const results = (response.data?.data || []).map((item: any) => ({
        id: item.id,
        label: `${item.subdistrict_name}, ${item.city_name}, ${item.province_name}`,
        subdistrict_name: item.subdistrict_name,
        district_name: item.district_name,
        city_name: item.city_name,
        province_name: item.province_name,
        zip_code: item.zip_code,
      }));

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (err: any) {
      console.error("❌ Komerce Search Error:", err?.response?.data || err.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch destination data from Komerce API",
          error: err?.response?.data?.message || err.message || "Unknown error",
        });
      }
    }
  }

  /**
   * @route   GET /api/rajaongkir/cost?shipper_destination_id=...&receiver_destination_id=...&weight=...&item_value=...
   * @desc    Calculate shipping cost using Komerce API
   * @access  Public
   */
  async calculateCost(req: Request, res: Response): Promise<void> {
    const {
      shipper_destination_id,
      receiver_destination_id,
      weight,
      item_value,
      cod,
    } = req.query;

    // Validasi parameter wajib
    if (
      !shipper_destination_id ||
      !receiver_destination_id ||
      !weight ||
      !item_value
    ) {
       res.status(400).json({
        success: false,
        message:
          "Parameter wajib: shipper_destination_id, receiver_destination_id, weight, item_value",
      });
    }

    // Validasi angka
    const weightNumber = Number(weight);
    const itemValueNumber = Number(item_value);
    if (isNaN(weightNumber) || isNaN(itemValueNumber)) {
       res.status(400).json({
        success: false,
        message: "Parameter weight dan item_value harus berupa angka",
      });
    }

    // Konversi flag COD
    const codFlag = typeof cod === "string" && cod.toLowerCase() === "yes" ? "yes" : "no";

    const apiKey = process.env.API_KEY_RAJA_ONGKIR;
    if (!apiKey) {
       res.status(500).json({
        success: false,
        message: "Missing 'API_KEY_RAJA_ONGKIR' in environment variables",
      });
    }

    const couriers = ["reguler", "cargo", "instant"];
    const results: Record<string, any[]> = {
      calculate_reguler: [],
      calculate_cargo: [],
      calculate_instant: [],
    };

    try {
      for (const courier of couriers) {
        const response = await axios.get(
          "https://api-sandbox.collaborator.komerce.id/tariff/api/v1/calculate",
          {
            headers: {
              "x-api-key": apiKey,
            },
            params: {
              shipper_destination_id: String(shipper_destination_id),
              receiver_destination_id: String(receiver_destination_id),
              weight: String(weightNumber),
              item_value: String(itemValueNumber),
              cod: codFlag,
              courier,
            },
          }
        );

        results[`calculate_${courier}`] = response.data?.data?.[`calculate_${courier}`] || [];
      }

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (err: any) {
      console.error("❌ Error Komerce Calculate:", err?.response?.data || err.message);
      res.status(500).json({
        success: false,
        message: "Gagal hitung ongkir dari Komerce",
        error: err?.response?.data || err.message,
      });
    }
  }
}
