import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { ProductController2 } from "../controller/product2.controller";

export class ProductRouter2 {
  private router: Router;
  private productController2: ProductController2;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.productController2 = new ProductController2();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    
    this.router.get("/new-arrivals",this.productController2.getNewArrivals);

  }

  getRouter() {
    return this.router;
  }
}
