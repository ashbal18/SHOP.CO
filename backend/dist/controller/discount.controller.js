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
exports.DiscountController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class DiscountController {
    constructor() {
        // ✅ Create new discount
        this.createDiscount = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, type, amount, isPercentage, minPurchase, maxDiscount, buyQuantity, getQuantity, productId, storeId, startDate, endDate, } = req.body;
                const user = req.user;
                if (!name || !type || amount == null || !storeId) {
                    res.status(400).json({ error: "Missing required fields" });
                }
                if (!startDate || isNaN(Date.parse(startDate))) {
                    res.status(400).json({ error: "Invalid start date" });
                }
                if (!endDate || isNaN(Date.parse(endDate))) {
                    res.status(400).json({ error: "Invalid end date" });
                }
                if (type === "MIN_PURCHASE" && minPurchase == null) {
                    res.status(400).json({ error: "Minimal pembelian diperlukan." });
                }
                if (type === "BUY_ONE_GET_ONE" &&
                    (buyQuantity == null || getQuantity == null)) {
                    res.status(400).json({ error: "Beli dan Gratis diperlukan." });
                }
                if (!productId) {
                    res.status(400).json({ error: "Produk harus dipilih" });
                }
                const product = yield prisma_1.default.product.findUnique({
                    where: { id: productId },
                });
                if (!product) {
                    res.status(404).json({ error: "Produk tidak ditemukan" });
                }
                const newDiscount = yield prisma_1.default.discount.create({
                    data: {
                        name,
                        type,
                        amount,
                        isPercentage,
                        minPurchase,
                        maxDiscount,
                        buyQuantity,
                        getQuantity,
                        productId,
                        storeId,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                    },
                });
                const discountedPrice = this.calculateDiscountedPrice(Object.assign(Object.assign({}, newDiscount), { product }));
                res.status(201).json({
                    message: "Discount created",
                    data: Object.assign(Object.assign({}, newDiscount), { originalPrice: product ? product.price : null, discountedPrice }),
                });
            }
            catch (error) {
                console.error("Error creating discount:", error);
                if (error.code === "P2002") {
                    res.status(400).json({ error: "Discount already exists" });
                }
                res.status(500).json({ error: "Internal server error" });
            }
        });
        // ✅ Get all discounts with discountedPrice
        this.getDiscounts = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const discounts = yield prisma_1.default.discount.findMany({
                    include: {
                        product: {
                            select: { id: true, name: true, price: true, imageUrl: true },
                        },
                        store: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: "desc" },
                });
                const processed = discounts.map((d) => (Object.assign(Object.assign({}, d), { discountedPrice: this.calculateDiscountedPrice(d) })));
                res.status(200).json(processed);
            }
            catch (error) {
                console.error("Error fetching discounts:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
        // ✅ Get all discounts by storeId
        this.getAllDiscountsByStore = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { storeId } = req.params;
            try {
                const discounts = yield prisma_1.default.discount.findMany({
                    where: { storeId },
                    include: {
                        product: {
                            select: { id: true, name: true, price: true, imageUrl: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                });
                const processed = discounts.map((d) => (Object.assign(Object.assign({}, d), { discountedPrice: this.calculateDiscountedPrice(d) })));
                res.status(200).json(processed);
            }
            catch (error) {
                console.error("Error fetching discounts by store:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
        // ✅ Get single discount by id
        this.getDiscountById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const discount = yield prisma_1.default.discount.findUnique({
                    where: { id },
                    include: {
                        product: {
                            select: { id: true, name: true, price: true, imageUrl: true },
                        },
                        store: { select: { id: true, name: true } },
                    },
                });
                if (!discount) {
                    res.status(404).json({ error: "Discount not found" });
                }
                res.status(200).json(Object.assign(Object.assign({}, discount), { discountedPrice: this.calculateDiscountedPrice(discount) }));
            }
            catch (error) {
                console.error("Error fetching discount:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
        // ✅ Update discount by ID
        this.updateDiscount = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, type, amount, isPercentage, minPurchase, maxDiscount, buyQuantity, getQuantity, productId, startDate, endDate, } = req.body;
            try {
                const existing = yield prisma_1.default.discount.findUnique({ where: { id } });
                if (!existing) {
                    res.status(404).json({ error: "Discount tidak ditemukan" });
                }
                if (!name || !type || amount == null || !productId) {
                    res.status(400).json({ error: "Field wajib tidak lengkap" });
                }
                if (!startDate || isNaN(Date.parse(startDate))) {
                    res.status(400).json({ error: "Tanggal mulai tidak valid" });
                }
                if (!endDate || isNaN(Date.parse(endDate))) {
                    res.status(400).json({ error: "Tanggal akhir tidak valid" });
                }
                if (type === "MIN_PURCHASE" && minPurchase == null) {
                    res.status(400).json({ error: "Minimal pembelian diperlukan." });
                }
                if (type === "BUY_ONE_GET_ONE" &&
                    (buyQuantity == null || getQuantity == null)) {
                    res.status(400).json({ error: "Jumlah beli dan gratis harus diisi." });
                }
                const updatedDiscount = yield prisma_1.default.discount.update({
                    where: { id },
                    data: {
                        name,
                        type,
                        amount,
                        isPercentage,
                        minPurchase,
                        maxDiscount,
                        buyQuantity,
                        getQuantity,
                        productId,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                    },
                    include: {
                        product: {
                            select: { id: true, name: true, price: true, imageUrl: true },
                        },
                        store: {
                            select: { id: true, name: true },
                        },
                    },
                });
                const discountedPrice = this.calculateDiscountedPrice(updatedDiscount);
                res.status(200).json({
                    message: "Diskon berhasil diperbarui",
                    data: Object.assign(Object.assign({}, updatedDiscount), { discountedPrice }),
                });
            }
            catch (error) {
                console.error("Error updating discount:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
        // ✅ Delete discount by ID
        this.deleteDiscount = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const user = req.user;
            try {
                const discount = yield prisma_1.default.discount.findUnique({ where: { id } });
                if (!discount) {
                    res.status(404).json({ error: "Diskon tidak ditemukan" });
                    return;
                }
                if (user.role === "ADMIN" && user.storeId !== discount.storeId) {
                    res.status(403).json({ error: "Akses ditolak" });
                    return;
                }
                yield prisma_1.default.discount.delete({ where: { id } });
                res.status(200).json({ message: "Diskon berhasil dihapus" });
            }
            catch (error) {
                console.error("Gagal menghapus diskon:", error);
                res.status(500).json({ error: "Terjadi kesalahan server" });
            }
        });
    }
    // 🔧 Utility method: Calculate discounted price
    calculateDiscountedPrice(discount) {
        var _a;
        const price = (_a = discount.product) === null || _a === void 0 ? void 0 : _a.price;
        if (price == null)
            return null;
        let finalPrice = price;
        switch (discount.type) {
            case "MANUAL":
                if (discount.isPercentage) {
                    const rawDiscount = (price * discount.amount) / 100;
                    const limitedDiscount = discount.maxDiscount != null
                        ? Math.min(rawDiscount, discount.maxDiscount)
                        : rawDiscount;
                    finalPrice = price - limitedDiscount;
                }
                else {
                    finalPrice = price - discount.amount;
                }
                break;
            case "MIN_PURCHASE":
                if (discount.isPercentage) {
                    const rawDiscount = (price * discount.amount) / 100;
                    const limitedDiscount = discount.maxDiscount != null
                        ? Math.min(rawDiscount, discount.maxDiscount)
                        : rawDiscount;
                    finalPrice = price - limitedDiscount;
                }
                else {
                    finalPrice = price - discount.amount;
                }
                break;
            case "BUY_ONE_GET_ONE":
                finalPrice = price; // tidak ada perubahan harga satuan
                break;
        }
        return Math.max(0, Math.round(finalPrice));
    }
}
exports.DiscountController = DiscountController;
