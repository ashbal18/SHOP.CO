import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { OrderController } from "../controller/user-order.controller";


export class userorderRouter {
  private router: Router;
  private orderController: OrderController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.orderController = new OrderController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.orderController.getUserTransactions
    );

  }

  getRouter() {
    return this.router;
  }
}
