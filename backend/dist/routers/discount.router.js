"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountRouter = void 0;
const express_1 = require("express");
const discount_controller_1 = require("../controller/discount.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
class DiscountRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.discountController = new discount_controller_1.DiscountController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ✅ CREATE - hanya STORE_ADMIN
        this.router.post("/", this.authMiddleware.verifyToken, this.discountController.createDiscount);
        // ✅ READ ALL - semua diskon dari semua store
        this.router.get("/", this.authMiddleware.verifyToken, this.discountController.getDiscounts);
        // ✅ READ by storeId - diskon berdasarkan toko
        this.router.get("/store/:storeId", this.authMiddleware.verifyToken, this.discountController.getAllDiscountsByStore);
        // ✅ READ by ID - detail diskon tertentu
        this.router.get("/:id", this.authMiddleware.verifyToken, this.discountController.getDiscountById);
        this.router.put("/:id", this.authMiddleware.verifyToken, this.discountController.updateDiscount);
        this.router.delete("/:id", this.authMiddleware.verifyToken, this.discountController.deleteDiscount);
    }
    getRouter() {
        return this.router;
    }
}
exports.DiscountRouter = DiscountRouter;
