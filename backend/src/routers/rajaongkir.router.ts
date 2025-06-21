import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { RajaOngkirController } from "../controller/rajaongkir.controller";

export class RajaOngkirRouter {
  private router: Router;
  private rajaOngkirController: RajaOngkirController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.rajaOngkirController = new RajaOngkirController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET /rajaongkir/provinces - Get all provinces

    this.router.get("/search", this.rajaOngkirController.searchDestination);
    this.router.get("/cost/", this.rajaOngkirController.calculateCost);
  }

  public getRouter(): Router {
    return this.router;
  }
}
