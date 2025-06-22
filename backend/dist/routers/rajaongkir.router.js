"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RajaOngkirRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rajaongkir_controller_1 = require("../controller/rajaongkir.controller");
class RajaOngkirRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.rajaOngkirController = new rajaongkir_controller_1.RajaOngkirController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // GET /rajaongkir/provinces - Get all provinces
        this.router.get("/search", this.rajaOngkirController.searchDestination);
        this.router.get("/cost/", this.rajaOngkirController.calculateCost);
    }
    getRouter() {
        return this.router;
    }
}
exports.RajaOngkirRouter = RajaOngkirRouter;
