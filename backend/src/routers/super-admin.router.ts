import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { SuperAdminController } from "../controller/super-admin.controller";

export class SuperAdminRouter {
  private router: Router;
  private superAdminController: SuperAdminController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.superAdminController = new SuperAdminController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute() {
    // Menggunakan middleware verifyToken dan verifySuperAdmin

    this.router.post("/", this.superAdminController.createstoreadmin);

    this.router.patch(
      "/:id",
       this.authMiddleware.verifyToken,
       this.superAdminController.editStoreAdmin);
    this.router.delete(
      '/:id',
      this.authMiddleware.verifyToken,
      this.superAdminController.deleteStoreAdmin);
  }

  getRouter(): Router {
    return this.router;
  }
}
