"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReportRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const salesreport_controller_1 = require("../controller/salesreport.controller");
class SalesReportRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.controller = new salesreport_controller_1.SalesReportController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ✅ SALES REPORT
        this.router.get("/sales/monthly", this.authMiddleware.verifyToken, this.controller.salesMonthly);
        this.router.get("/sales/category", this.authMiddleware.verifyToken, this.controller.salesByCategory);
        this.router.get("/sales/product", this.authMiddleware.verifyToken, this.controller.salesByProduct);
        // ✅ STOCK REPORT - Ringkasan stok bulanan semua produk
        this.router.get("/sales/stock/summary", this.authMiddleware.verifyToken, this.controller.stockSummary);
        // ✅ STOCK REPORT - Riwayat detail stok per produk
        this.router.get("/sales/stock/history", this.authMiddleware.verifyToken, this.controller.salesStockHistory);
        this.router.get("/product-stock", this.authMiddleware.verifyToken, this.controller.getAllProductWithStock);
        this.router.get("/sales/products/with-stock", this.authMiddleware.verifyToken, this.controller.getAllProductWithStock);
        this.router.post("/stock/remove", this.authMiddleware.verifyToken, this.controller.removeStock);
    }
    getRouter() {
        return this.router;
    }
}
exports.SalesReportRouter = SalesReportRouter;
