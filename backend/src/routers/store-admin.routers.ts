import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AdminController } from '../controller/store-admin.controller';



export class AdminRouter {
  private router: Router;
  private adminController: AdminController;
  private authMiddleware: AuthMiddleware;

  constructor() {
  this.router = Router();
  this.adminController = new AdminController();
  this.authMiddleware = new AuthMiddleware();

  // Bind method
  this.adminController.getStoreAdmins = this.adminController.getStoreAdmins.bind(this.adminController);

  this.initializeRoutes();
}


  private initializeRoutes() {
   
    this.router.get("/",this.adminController.getStoreAdmins);
   
  }

  getRouter(): Router {
    return this.router;
  }
}
