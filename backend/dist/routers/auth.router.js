"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const validation_1 = require("../middleware/validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_controller_1 = require("../controller/auth.controller");
class AuthRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authController = new auth_controller_1.AuthController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.router.post("/", validation_1.validateRegister, this.authController.register);
        this.router.post("/login", this.authController.login);
        this.router.patch("/verify", this.authMiddleware.verifyToken, this.authController.verify);
        this.router.post("/reset-password-request", this.authController.requestPasswordReset);
        // Password Reset Verification Route
        this.router.post("/reset-password-verify", this.authMiddleware.verifyToken, this.authController.verifyPasswordReset);
        this.router.post("/google", this.authController.loginOrRegisterWithGoogle);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRouter = AuthRouter;
