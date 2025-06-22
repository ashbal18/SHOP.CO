"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRouter2 = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const product2_controller_1 = require("../controller/product2.controller");
class ProductRouter2 {
    constructor() {
        this.router = (0, express_1.Router)();
        this.productController2 = new product2_controller_1.ProductController2();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/new-arrivals", this.productController2.getNewArrivals);
    }
    getRouter() {
        return this.router;
    }
}
exports.ProductRouter2 = ProductRouter2;
