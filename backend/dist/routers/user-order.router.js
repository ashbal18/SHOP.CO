"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userorderRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_order_controller_1 = require("../controller/user-order.controller");
class userorderRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.orderController = new user_order_controller_1.OrderController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.authMiddleware.verifyToken, this.orderController.getUserTransactions);
    }
    getRouter() {
        return this.router;
    }
}
exports.userorderRouter = userorderRouter;
