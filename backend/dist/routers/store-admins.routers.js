"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const store_admins_controller_1 = require("../controller/store-admins.controller");
class AdminsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.storeadminsController = new store_admins_controller_1.StoreAdminsController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.router.get("/", this.authMiddleware.verifyToken, this.storeadminsController.getAdmins);
        this.router.get("/:id", this.storeadminsController.getAdminById);
    }
    getRouter() {
        return this.router;
    }
}
exports.AdminsRouter = AdminsRouter;
