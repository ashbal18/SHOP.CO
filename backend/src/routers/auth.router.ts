import { Router } from "express";
import { validateRegister } from "../middleware/validation";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { AuthController } from "../controller/auth.controller";

export class AuthRouter {
  private router: Router;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.post("/", validateRegister, this.authController.register);
    this.router.post("/login", this.authController.login);
    this.router.patch(
      "/verify",
      this.authMiddleware.verifyToken,
      this.authController.verify
    );
     this.router.post(
      "/reset-password-request",
      this.authController.requestPasswordReset
    );

    // Password Reset Verification Route
    this.router.post(
      "/reset-password-verify",
      this.authMiddleware.verifyToken,
      this.authController.verifyPasswordReset
    );
    this.router.post("/google", this.authController.loginOrRegisterWithGoogle);
    
  }

  getRouter(): Router {
    return this.router;
  }
}
