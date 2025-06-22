"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const address_controller_1 = require("../controller/address.controller");
class AddressRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.addressController = new address_controller_1.AddressController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.router.get("/", this.authMiddleware.verifyToken, this.addressController.getAddresses);
        this.router.get("/:address_id", this.authMiddleware.verifyToken, this.addressController.getAddressById);
        this.router.post("/", this.authMiddleware.verifyToken, this.addressController.createAddress);
        this.router.put("/:address_id", this.authMiddleware.verifyToken, this.addressController.updateAddress);
        this.router.delete("/:address_id", this.authMiddleware.verifyToken, this.addressController.deleteAddress);
    }
    getRouter() {
        return this.router;
    }
}
exports.AddressRouter = AddressRouter;
