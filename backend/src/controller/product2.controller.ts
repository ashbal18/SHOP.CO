import { Request, Response } from "express";
import prisma from "../prisma";

export class ProductController2 {
  getNewArrivals = async (req: Request, res: Response) => {
    try {
      // Ambil produk terbaru, misalnya urutkan berdasarkan createdAt desc
      const products = await prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // ambil 10 produk terbaru
        include: {
          category: true,
          stocks: {
            include: {
              store: true,
            },
          },
          discount: true,
        },
      });

      const now = new Date();

      const productsWithDetails = products.map((product) => {
        const totalStock = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
        const firstStock = product.stocks[0];
        const store = firstStock?.store || null;

        const discount = Array.isArray(product.discount) && product.discount.length > 0 ? product.discount[0] : null;
        let finalPrice = product.price;

        const isDiscountActive =
          discount &&
          new Date(discount.startDate) <= now &&
          new Date(discount.endDate) >= now;

        if (isDiscountActive) {
          if (discount.isPercentage) {
            finalPrice = product.price - (product.price * discount.amount) / 100;
          } else {
            finalPrice = product.price - discount.amount;
          }

          if (finalPrice < 0) finalPrice = 0;
        }

        return {
          ...product,
          totalStock,
          store,
          discount: isDiscountActive ? discount : null,
          finalPrice,
        };
      });

      res.json(productsWithDetails);
    } catch (error) {
      console.error("Error while fetching new arrivals:", error);
      res.status(500).json({ message: "Failed to fetch new arrivals", error });
    }
  };
}
