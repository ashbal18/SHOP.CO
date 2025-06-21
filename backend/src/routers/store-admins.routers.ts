import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { UserController } from "../controller/user.controller";
import { StoreAdminsController } from "../controller/store-admins.controller";


export class AdminsRouter {
  private router: Router;
  private storeadminsController: StoreAdminsController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.storeadminsController = new StoreAdminsController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.storeadminsController.getAdmins
    );

    this.router.get("/:id", this.storeadminsController.getAdminById);
  }

  getRouter(): Router {
    return this.router;
  }
}
