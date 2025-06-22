"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const super_admin_controller_1 = require("../controller/super-admin.controller");
class SuperAdminRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.superAdminController = new super_admin_controller_1.SuperAdminController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        // Menggunakan middleware verifyToken dan verifySuperAdmin
        this.router.post("/", this.superAdminController.createstoreadmin);
        this.router.patch("/:id", this.authMiddleware.verifyToken, this.superAdminController.editStoreAdmin);
        this.router.delete('/:id', this.authMiddleware.verifyToken, this.superAdminController.deleteStoreAdmin);
    }
    getRouter() {
        return this.router;
    }
}
exports.SuperAdminRouter = SuperAdminRouter;
