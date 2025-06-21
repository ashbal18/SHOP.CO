import { Router } from "express";
import { TransactionController } from "../controller/transaction.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class TransactionRouter {
  private router: Router;
  private transactionController: TransactionController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.transactionController = new TransactionController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.transactionController.getAll
    );

    
    this.router.post(
      "/",
      this.authMiddleware.verifyToken,
      this.transactionController.create
    );

    
    this.router.post(
      "/status",
      this.transactionController.updateStatus 
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
