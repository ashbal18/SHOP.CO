"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const product_controller_1 = require("../controller/product.controller");
const uploader_1 = require("../helpers/uploader"); // pastikan path ini benar
class ProductRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.productController = new product_controller_1.ProductController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // POST /product - Buat produk baru dan upload gambar ke Cloudinary
        this.router.post("/", this.authMiddleware.verifyToken, (0, uploader_1.uploader)("memoryStorage", "PRODUCT_").single("image"), // ⬅️ pakai memoryStorage
        this.productController.createProduct);
        // PUT /product/:id - Update produk dan upload gambar baru jika ada
        this.router.put("/:id", this.authMiddleware.verifyToken, (0, uploader_1.uploader)("memoryStorage", "PRODUCT_").single("image"), this.productController.updateProduct);
        // GET /product - Ambil semua produk milik toko
        this.router.get("/", this.authMiddleware.verifyToken, this.productController.getProduct);
        this.router.get("/all", this.productController.getAllProducts);
        this.router.get("/:id", this.productController.getProductById);
        this.router.get("/store/:storeId", this.productController.getProductsByStoreId);
        this.router.post("/nearest", this.productController.getNearestProducts);
        this.router.delete("/:id", this.productController.deleteProduct);
    }
    getRouter() {
        return this.router;
    }
}
exports.ProductRouter = ProductRouter;
