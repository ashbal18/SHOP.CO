"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRouter = void 0;
const express_1 = require("express");
const transaction_controller_1 = require("../controller/transaction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
class TransactionRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.transactionController = new transaction_controller_1.TransactionController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.authMiddleware.verifyToken, this.transactionController.getAll);
        this.router.post("/", this.authMiddleware.verifyToken, this.transactionController.create);
        this.router.post("/status", this.transactionController.updateStatus);
    }
    getRouter() {
        return this.router;
    }
}
exports.TransactionRouter = TransactionRouter;
