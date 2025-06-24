import { Router } from "express";

import { AuthMiddleware } from "../middleware/auth.middleware";
import { SalesReportController } from "../controller/salesreport.controller";

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

    // ✅ STOCK REPORT - Ringkasan stok bulanan semua produk
    this.router.get(
      "/sales/stock/summary",
      this.authMiddleware.verifyToken,
      this.controller.stockSummary
    );

    // ✅ STOCK REPORT - Riwayat detail stok per produk
    this.router.get(
      "/sales/stock/history",
      this.authMiddleware.verifyToken,
      this.controller.salesStockHistory
    );

    this.router.post(
      "/stock/remove",
      this.authMiddleware.verifyToken,
      this.controller.removeStock
    );
  }

  public getRouter() {
    return this.router;
  }
}
