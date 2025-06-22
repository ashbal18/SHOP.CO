"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRouter = void 0;
const express_1 = require("express");
const category_controller_1 = require("../controller/category.controller");
class CategoryRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.categoryController = new category_controller_1.CategoryController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // GET /categories - ambil semua kategori
        this.router.get("/", this.categoryController.getCategories);
        // POST /categories - buat kategori baru
        this.router.post("/", this.categoryController.createCategory);
        // PATCH /categories/:id - update kategori
        this.router.patch("/:id", this.categoryController.updateCategory);
        // DELETE /categories/:id - hapus kategori
        this.router.delete("/:id", this.categoryController.deleteCategory);
    }
    getRouter() {
        return this.router;
    }
}
exports.CategoryRouter = CategoryRouter;
