"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class CategoryController {
    constructor() {
        this.createCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name } = req.body;
                if (!name) {
                    res.status(400).json({ error: "Missing required field: name" });
                }
                // Buat kategori baru
                const newCategory = yield prisma_1.default.category.create({
                    data: { name },
                });
                res.status(201).json(newCategory);
            }
            catch (error) {
                console.error("Error creating category:", error);
                // Kalau ada error unique constraint violation (name must be unique)
                if (error.code === 'P2002') {
                    res.status(400).json({ error: "Category name already exists" });
                }
                res.status(500).json({ error: "Internal server error" });
            }
        });
        this.getCategories = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield prisma_1.default.category.findMany({
                    include: {
                        products: true, // Jika mau, bisa sertakan produk yang ada di kategori ini
                    },
                });
                res.status(200).json(categories);
            }
            catch (error) {
                console.error("Error fetching categories:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
        this.updateCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { name } = req.body;
                if (!name) {
                    res.status(400).json({ error: "Missing required field: name" });
                }
                const updatedCategory = yield prisma_1.default.category.update({
                    where: { id },
                    data: { name },
                });
                res.status(200).json(updatedCategory);
            }
            catch (error) {
                console.error("Error updating category:", error);
                if (error.code === 'P2025') {
                    res.status(404).json({ error: "Category not found" });
                }
                if (error.code === 'P2002') {
                    res.status(400).json({ error: "Category name already exists" });
                }
                res.status(500).json({ error: "Internal server error" });
            }
        });
        this.deleteCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield prisma_1.default.category.delete({
                    where: { id },
                });
                res.status(200).json({ message: "Category deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting category:", error);
                if (error.code === 'P2025') {
                    res.status(404).json({ error: "Category not found" });
                }
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
}
exports.CategoryController = CategoryController;
