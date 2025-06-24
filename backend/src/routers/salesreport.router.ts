import { Router } from "express";
import { SalesReportController } from "../controller/SalesReport.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class SalesReportRouter {
  private router: Router;
  private controller: SalesReportController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new SalesReportController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // ✅ SALES REPORT
    this.router.get(
      "/sales/monthly",
      this.authMiddleware.verifyToken,
      this.controller.salesMonthly
    );

    this.router.get(
      "/sales/category",
      this.authMiddleware.verifyToken,
      this.controller.salesByCategory
    );

    this.router.get(
      "/sales/product",
      this.authMiddleware.verifyToken,
      this.controller.salesByProduct
    );

  }

  public getRouter() {
    return this.router;
  }
}
