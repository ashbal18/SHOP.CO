import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { ProductController } from "../controller/product.controller";
import { uploader } from "../helpers/uploader"; // pastikan path ini benar

export class ProductRouter {
  private router: Router;
  private productController: ProductController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.productController = new ProductController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // POST /product - Buat produk baru dan upload gambar ke Cloudinary
    this.router.post(
      "/",
      this.authMiddleware.verifyToken,
      uploader("memoryStorage", "PRODUCT_").single("image"), // ⬅️ pakai memoryStorage
      this.productController.createProduct
    );

    // PUT /product/:id - Update produk dan upload gambar baru jika ada
    this.router.put(
      "/:id",
      this.authMiddleware.verifyToken,
      uploader("memoryStorage", "PRODUCT_").single("image"),
      this.productController.updateProduct
    );

    // GET /product - Ambil semua produk milik toko
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.productController.getProduct
    );

    
    this.router.get("/all",this.productController.getAllProducts);
    this.router.get("/:id",this.productController.getProductById);
    this.router.get("/store/:storeId",this.productController.getProductsByStoreId);
    this.router.post("/nearest",this.productController.getNearestProducts);
    this.router.delete("/:id", this.productController.deleteProduct);


  }

  getRouter() {
    return this.router;
  }
}
