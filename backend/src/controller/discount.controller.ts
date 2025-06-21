import { Request, Response } from "express";
import prisma from "../prisma";

export class DiscountController {
  // ✅ Create new discount
  createDiscount = async (req: Request, res: Response) => {
    try {
      const {
        name,
        type,
        amount,
        isPercentage,
        minPurchase,
        maxDiscount,
        buyQuantity,
        getQuantity,
        productId,
        storeId,
        startDate,
        endDate,
      } = req.body;

      const user = req.user as { role: string; storeId?: string };

      if (!name || !type || amount == null || !storeId) {
         res.status(400).json({ error: "Missing required fields" });
      }

      if (!startDate || isNaN(Date.parse(startDate))) {
         res.status(400).json({ error: "Invalid start date" });
      }

      if (!endDate || isNaN(Date.parse(endDate))) {
         res.status(400).json({ error: "Invalid end date" });
      }

      if (type === "MIN_PURCHASE" && minPurchase == null) {
         res.status(400).json({ error: "Minimal pembelian diperlukan." });
      }

      if (
        type === "BUY_ONE_GET_ONE" &&
        (buyQuantity == null || getQuantity == null)
      ) {
         res.status(400).json({ error: "Beli dan Gratis diperlukan." });
      }

      if (!productId) {
         res.status(400).json({ error: "Produk harus dipilih" });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
         res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      const newDiscount = await prisma.discount.create({
        data: {
          name,
          type,
          amount,
          isPercentage,
          minPurchase,
          maxDiscount,
          buyQuantity,
          getQuantity,
          productId,
          storeId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      const discountedPrice = this.calculateDiscountedPrice({
        ...newDiscount,
        product,
      });

       res.status(201).json({
        message: "Discount created",
        data: {
          ...newDiscount,
          originalPrice: product ? product.price : null,
          discountedPrice,
        },
      });
    } catch (error: any) {
      console.error("Error creating discount:", error);
      if (error.code === "P2002") {
         res.status(400).json({ error: "Discount already exists" });
      }
       res.status(500).json({ error: "Internal server error" });
    }
  };

  // ✅ Get all discounts with discountedPrice
  getDiscounts = async (_req: Request, res: Response) => {
    try {
      const discounts = await prisma.discount.findMany({
        include: {
          product: {
            select: { id: true, name: true, price: true, imageUrl: true },
          },
          store: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const processed = discounts.map((d) => ({
        ...d,
        discountedPrice: this.calculateDiscountedPrice(d),
      }));

       res.status(200).json(processed);
    } catch (error) {
      console.error("Error fetching discounts:", error);
       res.status(500).json({ error: "Internal server error" });
    }
  };

  // ✅ Get all discounts by storeId
  getAllDiscountsByStore = async (req: Request, res: Response) => {
    const { storeId } = req.params;

    try {
      const discounts = await prisma.discount.findMany({
        where: { storeId },
        include: {
          product: {
            select: { id: true, name: true, price: true, imageUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const processed = discounts.map((d) => ({
        ...d,
        discountedPrice: this.calculateDiscountedPrice(d),
      }));

       res.status(200).json(processed);
    } catch (error) {
      console.error("Error fetching discounts by store:", error);
       res.status(500).json({ error: "Internal server error" });
    }
  };

  // ✅ Get single discount by id
  getDiscountById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const discount = await prisma.discount.findUnique({
        where: { id },
        include: {
          product: {
            select: { id: true, name: true, price: true, imageUrl: true },
          },
          store: { select: { id: true, name: true } },
        },
      });

      if (!discount) {
         res.status(404).json({ error: "Discount not found" });
      }

       res.status(200).json({
        ...discount,
        discountedPrice: this.calculateDiscountedPrice(discount),
      });
    } catch (error) {
      console.error("Error fetching discount:", error);
       res.status(500).json({ error: "Internal server error" });
    }
  };

  // 🔧 Utility method: Calculate discounted price
  private calculateDiscountedPrice(discount: any): number | null {
    const price = discount.product?.price;
    if (price == null) return null;

    let finalPrice = price;

    switch (discount.type) {
      case "MANUAL":
        if (discount.isPercentage) {
          const rawDiscount = (price * discount.amount) / 100;
          const limitedDiscount =
            discount.maxDiscount != null
              ? Math.min(rawDiscount, discount.maxDiscount)
              : rawDiscount;
          finalPrice = price - limitedDiscount;
        } else {
          finalPrice = price - discount.amount;
        }
        break;

      case "MIN_PURCHASE":
        if (discount.isPercentage) {
          finalPrice = price - (price * discount.amount) / 100;
        } else {
          finalPrice = price - discount.amount;
        }
        break;

      case "BUY_ONE_GET_ONE":
        // Tidak memengaruhi harga unit (umumnya dihitung di keranjang pembelian)
        finalPrice = price;
        break;
    }

    return Math.max(0, Math.round(finalPrice));
  }
  // ✅ Update discount by ID
updateDiscount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    type,
    amount,
    isPercentage,
    minPurchase,
    maxDiscount,
    buyQuantity,
    getQuantity,
    productId,
    startDate,
    endDate,
  } = req.body;

  try {
    const existing = await prisma.discount.findUnique({ where: { id } });

    if (!existing) {
       res.status(404).json({ error: "Discount tidak ditemukan" });
    }

    if (!name || !type || amount == null || !productId) {
       res.status(400).json({ error: "Field wajib tidak lengkap" });
    }

    if (!startDate || isNaN(Date.parse(startDate))) {
       res.status(400).json({ error: "Tanggal mulai tidak valid" });
    }

    if (!endDate || isNaN(Date.parse(endDate))) {
       res.status(400).json({ error: "Tanggal akhir tidak valid" });
    }

    if (type === "MIN_PURCHASE" && minPurchase == null) {
       res.status(400).json({ error: "Minimal pembelian diperlukan." });
    }

    if (
      type === "BUY_ONE_GET_ONE" &&
      (buyQuantity == null || getQuantity == null)
    ) {
       res
        .status(400)
        .json({ error: "Jumlah beli dan gratis harus diisi." });
    }

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        name,
        type,
        amount,
        isPercentage,
        minPurchase,
        maxDiscount,
        buyQuantity,
        getQuantity,
        productId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        product: {
          select: { id: true, name: true, price: true, imageUrl: true },
        },
        store: {
          select: { id: true, name: true },
        },
      },
    });

    const discountedPrice = this.calculateDiscountedPrice(updatedDiscount);

     res.status(200).json({
      message: "Diskon berhasil diperbarui",
      data: {
        ...updatedDiscount,
        discountedPrice,
      },
    });
  } catch (error) {
    console.error("Error updating discount:", error);
     res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Delete discount by ID
deleteDiscount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as { role: string; storeId?: string };

  try {
    const discount = await prisma.discount.findUnique({ where: { id } });

    if (!discount) {
       res.status(404).json({ error: "Diskon tidak ditemukan" });
       return;
    }

    
    if (user.role === "ADMIN" && user.storeId !== discount.storeId) {
       res.status(403).json({ error: "Akses ditolak" });
       return;
    }

    await prisma.discount.delete({ where: { id } });

     res.status(200).json({ message: "Diskon berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus diskon:", error);
     res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};


}
