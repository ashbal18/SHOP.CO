"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const store_admin_controller_1 = require("../controller/store-admin.controller");
class AdminRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.adminController = new store_admin_controller_1.AdminController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        // Bind method
        this.adminController.getStoreAdmins = this.adminController.getStoreAdmins.bind(this.adminController);
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.adminController.getStoreAdmins);
    }
    getRouter() {
        return this.router;
    }
}
exports.AdminRouter = AdminRouter;
