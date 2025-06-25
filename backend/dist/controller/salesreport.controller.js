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
exports.SalesReportController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class SalesReportController {
    salesMonthly(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, storeId } = req.query;
                const user = req.user;
                if (!user)
                    res.status(401).json({ error: "Unauthorized" });
                if (!year)
                    res.status(400).json({ error: "Tahun diperlukan" });
                const parsedYear = parseInt(year, 10);
                if (isNaN(parsedYear))
                    res.status(400).json({ error: "Tahun tidak valid" });
                let filterStoreId = undefined;
                if (user && user.role === "super_admin") {
                    filterStoreId = storeId;
                }
                else if (user) {
                    filterStoreId = user.storeId;
                }
                const orders = yield prisma_1.default.order.findMany({
                    where: Object.assign(Object.assign({ status: { in: ["PAID", "COMPLETED"] } }, (filterStoreId ? { storeId: filterStoreId } : {})), { createdAt: {
                            gte: new Date(parsedYear, 0, 1),
                            lte: new Date(parsedYear, 11, 31, 23, 59, 59, 999),
                        } }),
                    select: {
                        createdAt: true,
                        totalAmount: true,
                    },
                });
                const monthlyReport = Array.from({ length: 12 }, (_, i) => ({
                    month: i + 1,
                    totalAmount: 0,
                }));
                for (const order of orders) {
                    const monthIndex = new Date(order.createdAt).getMonth();
                    monthlyReport[monthIndex].totalAmount += order.totalAmount;
                }
                res.json(monthlyReport);
            }
            catch (err) {
                console.error("salesMonthly error:", err);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    salesByCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { year, month, storeId } = req.query;
                const user = req.user;
                if (!user)
                    res.status(401).json({ error: "Unauthorized" });
                const parsedYear = parseInt(year);
                const parsedMonth = parseInt(month);
                if (isNaN(parsedYear) || isNaN(parsedMonth)) {
                    res.status(400).json({ error: "Tahun dan bulan diperlukan" });
                }
                let filterStoreId = undefined;
                if (user && user.role === "super_admin") {
                    filterStoreId = storeId;
                }
                else if (user) {
                    filterStoreId = user.storeId;
                }
                const orderItems = yield prisma_1.default.orderItem.findMany({
                    where: {
                        order: Object.assign(Object.assign({ status: { in: ["PAID", "COMPLETED"] } }, (filterStoreId ? { storeId: filterStoreId } : {})), { createdAt: {
                                gte: new Date(parsedYear, parsedMonth - 1, 1),
                                lt: new Date(parsedYear, parsedMonth, 1),
                            } }),
                    },
                    include: {
                        product: { include: { category: true } },
                    },
                });
                const result = {};
                for (const item of orderItems) {
                    const category = (_b = (_a = item.product.category) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Uncategorized";
                    if (!result[category]) {
                        result[category] = { category, totalSold: 0, totalRevenue: 0 };
                    }
                    result[category].totalSold += item.quantity;
                    result[category].totalRevenue += item.quantity * item.price;
                }
                res.json(Object.values(result));
            }
            catch (err) {
                console.error("salesByCategory error:", err);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    salesByProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, month, storeId } = req.query;
                const user = req.user;
                if (!user)
                    res.status(401).json({ error: "Unauthorized" });
                const parsedYear = parseInt(year);
                const parsedMonth = parseInt(month);
                if (isNaN(parsedYear) || isNaN(parsedMonth)) {
                    res.status(400).json({ error: "Tahun dan bulan diperlukan" });
                }
                let filterStoreId = undefined;
                if (user && user.role === "super_admin") {
                    filterStoreId = storeId;
                }
                else if (user) {
                    filterStoreId = user.storeId;
                }
                const orderItems = yield prisma_1.default.orderItem.findMany({
                    where: {
                        order: Object.assign(Object.assign({ status: { in: ["PAID", "COMPLETED"] } }, (filterStoreId ? { storeId: filterStoreId } : {})), { createdAt: {
                                gte: new Date(parsedYear, parsedMonth - 1, 1),
                                lt: new Date(parsedYear, parsedMonth, 1),
                            } }),
                    },
                    include: { product: true },
                });
                const result = {};
                for (const item of orderItems) {
                    const product = item.product;
                    if (!result[product.id]) {
                        result[product.id] = {
                            productId: product.id,
                            name: product.name,
                            totalSold: 0,
                            totalRevenue: 0,
                        };
                    }
                    result[product.id].totalSold += item.quantity;
                    result[product.id].totalRevenue += item.quantity * item.price;
                }
                res.json(Object.values(result));
            }
            catch (err) {
                console.error("salesByProduct error:", err);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    stockSummary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, month, storeId } = req.query;
                const user = req.user;
                if (!user)
                    res.status(401).json({ error: "Unauthorized" });
                if (!year || !month)
                    res.status(400).json({ error: "Tahun dan bulan diperlukan" });
                const parsedYear = parseInt(year);
                const parsedMonth = parseInt(month);
                if (isNaN(parsedYear) || isNaN(parsedMonth)) {
                    res.status(400).json({ error: "Tahun dan bulan tidak valid" });
                }
                let filterStoreId;
                if (user && user.role === "super_admin") {
                    filterStoreId = storeId;
                }
                else if (user) {
                    filterStoreId = user.storeId;
                }
                const histories = yield prisma_1.default.stockHistory.findMany({
                    where: Object.assign(Object.assign({}, (filterStoreId ? { storeId: filterStoreId } : {})), { createdAt: {
                            gte: new Date(parsedYear, parsedMonth - 1, 1),
                            lt: new Date(parsedYear, parsedMonth, 1),
                        } }),
                });
                let totalAdd = 0;
                let totalRemove = 0;
                for (const h of histories) {
                    if (h.type === "ADD")
                        totalAdd += h.quantity;
                    else if (h.type === "REMOVE")
                        totalRemove += h.quantity;
                }
                const productStocks = yield prisma_1.default.productStock.findMany({
                    where: filterStoreId ? { storeId: filterStoreId } : {},
                });
                const result = {
                    totalAdded: totalAdd,
                    totalRemoved: totalRemove,
                    stockEnding: productStocks.reduce((sum, s) => sum + s.quantity, 0),
                };
                res.json(result);
            }
            catch (err) {
                console.error("stockSummary error:", err);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    salesStockHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, month, storeId, productId } = req.query;
                const user = req.user;
                if (!year || !month) {
                    res.status(400).json({ error: "Tahun dan bulan diperlukan" });
                }
                const parsedYear = parseInt(year);
                const parsedMonth = parseInt(month);
                let filterStoreId;
                if ((user === null || user === void 0 ? void 0 : user.role) === "super_admin") {
                    filterStoreId = storeId;
                }
                else {
                    filterStoreId = user.storeId;
                }
                const histories = yield prisma_1.default.stockHistory.findMany({
                    where: Object.assign(Object.assign(Object.assign({}, (filterStoreId ? { storeId: filterStoreId } : {})), (productId ? { productId: productId } : {})), { createdAt: {
                            gte: new Date(parsedYear, parsedMonth - 1, 1),
                            lte: new Date(parsedYear, parsedMonth, 0, 23, 59, 59),
                        } }),
                    include: {
                        product: true,
                    },
                });
                const formatted = histories.map((item) => ({
                    productId: item.productId,
                    productName: item.product.name,
                    type: item.type,
                    quantity: item.quantity,
                    description: item.description,
                    date: item.createdAt,
                }));
                res.json(formatted);
            }
            catch (error) {
                console.error("salesStockHistory error:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    removeStock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId, storeId, quantity, description } = req.body;
                const user = req.user;
                if (!user)
                    res.status(401).json({ error: "Unauthorized" });
                if (!productId || !quantity || !description) {
                    res.status(400).json({ error: "Data tidak lengkap" });
                }
                const qty = parseInt(quantity);
                if (isNaN(qty) || qty <= 0) {
                    res.status(400).json({ error: "Jumlah tidak valid" });
                }
                // Cek storeId berdasarkan role
                let targetStoreId = storeId;
                if (!user || user.role !== "super_admin") {
                    targetStoreId = user.storeId;
                }
                if (!targetStoreId) {
                    res.status(400).json({ error: "Store ID diperlukan" });
                }
                // Cek apakah stok cukup
                const existing = yield prisma_1.default.productStock.findFirst({
                    where: {
                        productId,
                        storeId: targetStoreId,
                    },
                });
                if (!existing || existing.quantity < qty) {
                    res.status(400).json({ error: "Stok tidak mencukupi" });
                    return;
                }
                // Update stok
                const updated = yield prisma_1.default.productStock.update({
                    where: {
                        id: existing.id,
                    },
                    data: {
                        quantity: existing.quantity - qty,
                    },
                });
                // Catat history
                yield prisma_1.default.stockHistory.create({
                    data: {
                        productId,
                        storeId: targetStoreId,
                        quantity: qty,
                        type: "REMOVE",
                        description,
                    },
                });
                res.json({
                    message: "Stok berhasil dikurangi",
                    updatedStock: updated,
                });
            }
            catch (err) {
                console.error("removeStock error:", err);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
}
exports.SalesReportController = SalesReportController;
