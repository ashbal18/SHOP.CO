import { Router } from "express";
import { DiscountController } from "../controller/discount.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class DiscountRouter {
  private router: Router;
  private discountController: DiscountController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.discountController = new DiscountController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // ✅ CREATE - hanya STORE_ADMIN
    this.router.post(
      "/",
      this.authMiddleware.verifyToken,
      this.discountController.createDiscount
    );

    // ✅ READ ALL - semua diskon dari semua store
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.discountController.getDiscounts
    );

    // ✅ READ by storeId - diskon berdasarkan toko
    this.router.get(
      "/store/:storeId",
      this.authMiddleware.verifyToken,
      this.discountController.getAllDiscountsByStore
    );

    // ✅ READ by ID - detail diskon tertentu
    this.router.get(
      "/:id",
      this.authMiddleware.verifyToken,
      this.discountController.getDiscountById
    );

 
    this.router.put(
      "/:id",
      this.authMiddleware.verifyToken,
      this.discountController.updateDiscount
    );

    this.router.delete(
      "/:id",
      this.authMiddleware.verifyToken,
      this.discountController.deleteDiscount
    );
  }

  public getRouter() {
    return this.router;
  }
}
