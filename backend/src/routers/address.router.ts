import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { AddressController } from "../controller/address.controller";

export class AddressRouter {
  private router: Router;
  private addressController: AddressController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.addressController = new AddressController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.addressController.getAddresses
    );

    this.router.get(
      "/:address_id",
      this.authMiddleware.verifyToken,
      this.addressController.getAddressById
    );

    this.router.post(
      "/",
      this.authMiddleware.verifyToken,
      this.addressController.createAddress
    );

    this.router.put(
      "/:address_id",
      this.authMiddleware.verifyToken,
      this.addressController.updateAddress
    );

    this.router.delete(
      "/:address_id",
      this.authMiddleware.verifyToken,
      this.addressController.deleteAddress
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
