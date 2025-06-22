"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const store_controller_1 = require("../controller/store.controller");
class StoreRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.storeController = new store_controller_1.StoreController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        // POST /store  -> buat store (gunakan verifyToken middleware)
        this.router.post('/', this.authMiddleware.verifyToken, this.storeController.createStore);
        // GET /store  -> dapatkan semua store (gunakan verifyToken middleware)
        this.router.get('/', this.authMiddleware.verifyToken, this.storeController.getStores);
        this.router.get('/product', this.authMiddleware.verifyToken, this.storeController.getProducts);
        // PUT /store/:id -> update store by id (gunakan verifyToken middleware)
        this.router.patch('/:id', this.authMiddleware.verifyToken, this.storeController.updateStore);
        // DELETE /store/:id  -> hapus store by id (gunakan verifyToken middleware)
        this.router.delete('/:id', this.authMiddleware.verifyToken, this.storeController.deleteStore);
    }
    getRouter() {
        return this.router;
    }
}
exports.StoreRouter = StoreRouter;
