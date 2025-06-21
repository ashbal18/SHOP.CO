import { Router } from "express";
import { CategoryController } from "../controller/category.controller";

export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;

  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET /categories - ambil semua kategori
    this.router.get("/", this.categoryController.getCategories);

    // POST /categories - buat kategori baru
    this.router.post("/", this.categoryController.createCategory);

    // PATCH /categories/:id - update kategori
    this.router.patch("/:id", this.categoryController.updateCategory);

    // DELETE /categories/:id - hapus kategori
    this.router.delete("/:id", this.categoryController.deleteCategory);
  }

  getRouter(): Router {
    return this.router;
  }
}
