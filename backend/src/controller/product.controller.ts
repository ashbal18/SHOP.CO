import { Request, Response } from "express";
import prisma from "../prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../helpers/cloudinary";

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
};
export class ProductController {
  createProduct = async (req: Request, res: Response) => {
    try {
      const { name, description, price, categoryId, storeId, quantity } =
        req.body;

      if (!name || !description || !price || !categoryId || !storeId) {
        res.status(400).json({
          error:
            "Missing required fields: name, description, price, categoryId, storeId",
        });
      }

      const priceInt = parseInt(price);
      const quantityInt = parseInt(quantity ?? "0");

      if (isNaN(priceInt) || priceInt < 0) {
        res
          .status(400)
          .json({ error: "Price must be a valid positive integer" });
      }

      if (isNaN(quantityInt) || quantityInt < 0) {
        res
          .status(400)
          .json({ error: "Quantity must be a valid non-negative integer" });
      }

      let imageUrl = "";
      if (req.file) {
        const result = await cloudinaryUpload(req.file, "products");
        imageUrl = result.secure_url;
      }

      const newProduct = await prisma.product.create({
        data: {
          name,
          description,
          price: priceInt,
          imageUrl,
          categoryId,
        },
      });

      await prisma.productStock.create({
        data: {
          productId: newProduct.id,
          storeId,
          quantity: quantityInt,
        },
      });

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, price, categoryId } = req.body;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        res.status(404).json({ message: "Produk tidak ditemukan" });
        return;
      }
      let imageUrl = product.imageUrl;
      if (req.file) {
        if (product.imageUrl) {
          await cloudinaryRemove(product.imageUrl);
        }
        const result = await cloudinaryUpload(req.file, "products");
        imageUrl = result.secure_url;
      }
      const priceInt = parseInt(price);
      if (isNaN(priceInt) || priceInt < 0) {
        res
          .status(400)
          .json({ error: "Price must be a valid positive integer" });
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          price: priceInt,
          categoryId,
          imageUrl,
        },
      });

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Gagal memperbarui produk", error });
    }
  };

  getProduct = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
      }

      const store = await prisma.store.findUnique({
        where: { adminId: String(userId) },
      });

      if (!store) {
        res.status(403).json({ message: "Anda belum memiliki toko" });
        return;
      }

      const products = await prisma.product.findMany({
        where: {
          stocks: {
            some: {
              storeId: store.id,
            },
          },
        },
        include: {
          category: true,
          discount: true, // ✅ include diskon
          stocks: {
            where: { storeId: store.id },
            include: {
              store: {
                include: {
                  admin: true,
                },
              },
            },
          },
        },
      });

      // Optional: hitung finalPrice untuk masing-masing produk di sini
      const result = products.map((product) => {
        let finalPrice = product.price;
        const discountArr = product.discount;
        const discount =
          Array.isArray(discountArr) && discountArr.length > 0
            ? discountArr[0]
            : null;

        if (discount) {
          const now = new Date();
          const isValid =
            new Date(discount.startDate) <= now &&
            new Date(discount.endDate) >= now;

          if (isValid) {
            if (discount.isPercentage) {
              finalPrice = Math.round(
                product.price * (1 - discount.amount / 100)
              );
            } else {
              finalPrice = Math.max(0, product.price - discount.amount);
            }
          } else {
            product.discount = []; // jika diskon sudah tidak berlaku
          }
        }

        return {
          ...product,
          finalPrice,
        };
      });

      res.json(result);
    } catch (error) {
      console.error("Error saat mengambil produk:", error);
      res.status(500).json({ message: "Gagal mengambil produk", error });
    }
  };

  // src/controllers/ProductController.ts
  getAllProducts = async (req: Request, res: Response) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: true,
          stocks: {
            include: {
              store: true,
            },
          },
          discount: true, // Tambahkan relasi discount
        },
      });

      const now = new Date();

      const productsWithDetails = products.map((product) => {
        const totalStock = product.stocks.reduce(
          (sum, stock) => sum + stock.quantity,
          0
        );
        const firstStock = product.stocks[0];
        const store = firstStock?.store || null;

        // Cek apakah ada diskon aktif
        const discount =
          Array.isArray(product.discount) && product.discount.length > 0
            ? product.discount[0]
            : null;
        let finalPrice = product.price;

        const isDiscountActive =
          discount &&
          new Date(discount.startDate) <= now &&
          new Date(discount.endDate) >= now;

        if (isDiscountActive) {
          if (discount.isPercentage) {
            finalPrice =
              product.price - (product.price * discount.amount) / 100;
          } else {
            finalPrice = product.price - discount.amount;
          }

          // Pastikan finalPrice tidak negatif
          if (finalPrice < 0) finalPrice = 0;
        }

        return {
          ...product,
          totalStock,
          store,
          discount: isDiscountActive ? discount : null,
          finalPrice, // harga setelah diskon
        };
      });

      res.json(productsWithDetails);
    } catch (error) {
      console.error("Error while fetching all products:", error);
      res.status(500).json({ message: "Failed to fetch all products", error });
    }
  };

  getProductById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
         res.status(400).json({ message: "Missing id parameter" });
      }

      const now = new Date();

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          discount: {
            where: {
              startDate: { lte: now },
              endDate: { gte: now },
            },
            orderBy: { startDate: "desc" },
            take: 1,
          },
          stocks: {
            include: {
              store: {
                select: {
                  id: true,
                  name: true,
                  city_id: true, // ✅ tambahkan ini
                },
              },
            },
          },
        },
      });

      if (!product) {
         res.status(404).json({ message: "Product not found" });
         return;
      }

      const storeStock = product.stocks[0];
      const store = storeStock?.store || null;
      const storeId = storeStock?.storeId || null;

      let finalPrice = product.price;
      const activeDiscount = product.discount[0];

      if (activeDiscount) {
        if (activeDiscount.isPercentage) {
          finalPrice = Math.round(
            product.price * (1 - activeDiscount.amount / 100)
          );
        } else {
          finalPrice = Math.max(0, product.price - activeDiscount.amount);
        }
      }

      res.status(200).json({
        ...product,
        storeId,
        store, // ✅ kirim data toko (termasuk city_id)
        discount: activeDiscount || null,
        finalPrice,
      });
    } catch (error) {
      console.error("Error while fetching product by id:", error);
      res.status(500).json({ message: "Failed to fetch product by id", error });
    }
  };

  getProductsByStoreId = async (req: Request, res: Response) => {
    try {
      const { storeId } = req.params;

      if (!storeId) {
        res.status(400).json({ error: "storeId is required" });
      }

      const products = await prisma.product.findMany({
        where: {
          stocks: {
            some: {
              storeId,
            },
          },
        },
        include: {
          stocks: {
            where: {
              storeId,
            },
          },
        },
      });

      const result = products.map((product) => {
        const stock = product.stocks[0]; // asumsi 1 stock per store
        return {
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: stock?.quantity ?? 0,
        };
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching products by storeId:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getNearestProducts = async (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: "Latitude dan longitude diperlukan" });
    }

    try {
      const stores = await prisma.store.findMany({
        where: {
          latitude: { not: null },
          longitude: { not: null },
        },
        include: {
          products: {
            include: {
              product: {
                include: {
                  discount: true,
                },
              },
            },
          },
        },
      });

      if (stores.length === 0) {
        res
          .status(404)
          .json({ error: "Tidak ada toko dengan koordinat tersedia." });
      }

      let nearestStore = null;
      let minDistance = Infinity;

      for (const store of stores) {
        const distance = haversineDistance(
          Number(latitude),
          Number(longitude),
          Number(store.latitude),
          Number(store.longitude)
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestStore = { ...store, distance };
        }
      }

      if (!nearestStore) {
        res.status(404).json({ error: "Tidak ditemukan toko terdekat." });
        return;
      }

      const now = new Date();

      const products = nearestStore.products.map((stock) => {
        const { product } = stock;
        let finalPrice = product.price;

        const discountArr = product.discount;
        const discount =
          Array.isArray(discountArr) && discountArr.length > 0
            ? discountArr[0]
            : null;

        if (
          discount &&
          new Date(discount.startDate) <= now &&
          new Date(discount.endDate) >= now
        ) {
          finalPrice = discount.isPercentage
            ? product.price - (product.price * discount.amount) / 100
            : product.price - discount.amount;
        }

        return {
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          finalPrice: Math.max(finalPrice, 0),
          discount: discount
            ? {
                id: discount.id,
                amount: discount.amount,
                isPercentage: discount.isPercentage,
                startDate: discount.startDate,
                endDate: discount.endDate,
              }
            : null,
          quantity: stock.quantity,
        };
      });

      const response = {
        nearestStore: {
          id: nearestStore.id,
          name: nearestStore.name,
          address: nearestStore.address,
          latitude: nearestStore.latitude,
          longitude: nearestStore.longitude,
          distance: parseFloat(nearestStore.distance.toFixed(2)),
        },
        products,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Terjadi kesalahan server." });
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cari produk terlebih dahulu
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stocks: true,
        discount: true,
      },
    });

    if (!product) {
       res.status(404).json({ message: "Produk tidak ditemukan" });
       return;
    }

    // Hapus stok produk dari semua store
    await prisma.productStock.deleteMany({
      where: { productId: id },
    });

    // Hapus relasi diskon (jika ada)
    await prisma.discount.deleteMany({
      where: { productId: id },
    });

    // Hapus gambar dari Cloudinary jika ada
    if (product.imageUrl) {
      await cloudinaryRemove(product.imageUrl);
    }

    // Hapus produk
    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    res.status(500).json({ message: "Gagal menghapus produk", error });
  }
};

}
