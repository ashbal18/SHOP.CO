import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { RewardController } from "../controller/reward.controller";

export class RewardRouter {
  private router: Router;
  private rewardController: RewardController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.rewardController = new RewardController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.rewardController.getReward
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
