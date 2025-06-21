import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { StoreController } from '../controller/store.controller';

export class StoreRouter {
  private router: Router;
  private storeController: StoreController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.storeController = new StoreController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute() {
    // POST /store  -> buat store (gunakan verifyToken middleware)
    this.router.post(
      '/',
      this.authMiddleware.verifyToken,
      this.storeController.createStore
    );

    // GET /store  -> dapatkan semua store (gunakan verifyToken middleware)
    this.router.get(
      '/',
      this.authMiddleware.verifyToken,
      this.storeController.getStores
    );

    this.router.get(
      '/product',
      this.authMiddleware.verifyToken,
      this.storeController.getProducts
    );

    // PUT /store/:id -> update store by id (gunakan verifyToken middleware)
    this.router.patch(
      '/:id',
      this.authMiddleware.verifyToken,
      this.storeController.updateStore
    );

    // DELETE /store/:id  -> hapus store by id (gunakan verifyToken middleware)
    this.router.delete(
      '/:id',
      this.authMiddleware.verifyToken,
      this.storeController.deleteStore
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
