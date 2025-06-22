"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RajaOngkirController = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class RajaOngkirController {
    /**
     * @route   GET /api/rajaongkir/search?keyword=padang
     * @desc    Search destination from Komerce API by keyword
     * @access  Public
     */
    searchDestination(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
                const response = yield axios_1.default.get("https://api-sandbox.collaborator.komerce.id/tariff/api/v1/destination/search", {
                    headers: {
                        "x-api-key": apiKey,
                    },
                    params: { keyword },
                });
                const results = (((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []).map((item) => ({
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
            }
            catch (err) {
                console.error("❌ Komerce Search Error:", ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.data) || err.message);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: "Failed to fetch destination data from Komerce API",
                        error: ((_d = (_c = err === null || err === void 0 ? void 0 : err.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) || err.message || "Unknown error",
                    });
                }
            }
        });
    }
    /**
     * @route   GET /api/rajaongkir/cost?shipper_destination_id=...&receiver_destination_id=...&weight=...&item_value=...
     * @desc    Calculate shipping cost using Komerce API
     * @access  Public
     */
    calculateCost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const { shipper_destination_id, receiver_destination_id, weight, item_value, cod, } = req.query;
            // Validasi parameter wajib
            if (!shipper_destination_id ||
                !receiver_destination_id ||
                !weight ||
                !item_value) {
                res.status(400).json({
                    success: false,
                    message: "Parameter wajib: shipper_destination_id, receiver_destination_id, weight, item_value",
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
            const results = {
                calculate_reguler: [],
                calculate_cargo: [],
                calculate_instant: [],
            };
            try {
                for (const courier of couriers) {
                    const response = yield axios_1.default.get("https://api-sandbox.collaborator.komerce.id/tariff/api/v1/calculate", {
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
                    });
                    results[`calculate_${courier}`] = ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b[`calculate_${courier}`]) || [];
                }
                res.status(200).json({
                    success: true,
                    data: results,
                });
            }
            catch (err) {
                console.error("❌ Error Komerce Calculate:", ((_c = err === null || err === void 0 ? void 0 : err.response) === null || _c === void 0 ? void 0 : _c.data) || err.message);
                res.status(500).json({
                    success: false,
                    message: "Gagal hitung ongkir dari Komerce",
                    error: ((_d = err === null || err === void 0 ? void 0 : err.response) === null || _d === void 0 ? void 0 : _d.data) || err.message,
                });
            }
        });
    }
}
exports.RajaOngkirController = RajaOngkirController;
