import { Request, Response } from "express";
import prisma from "../prisma";

export class SalesReportController {
  async salesMonthly(req: Request, res: Response) {
    try {
      const { year, storeId } = req.query;
      const user = req.user;

      if (!user)  res.status(401).json({ error: "Unauthorized" });
      if (!year) res.status(400).json({ error: "Tahun diperlukan" });

      const parsedYear = parseInt(year as string, 10);
      if (isNaN(parsedYear))  res.status(400).json({ error: "Tahun tidak valid" });

      let filterStoreId: string | undefined = undefined;
      if (user && user.role === "super_admin") {
        filterStoreId = storeId as string | undefined;
      } else if (user) {
        filterStoreId = (user as any).storeId;
      }

      const orders = await prisma.order.findMany({
        where: {
          status: { in: ["PAID", "COMPLETED"] },
          ...(filterStoreId ? { storeId: filterStoreId } : {}),
          createdAt: {
            gte: new Date(parsedYear, 0, 1),
            lte: new Date(parsedYear, 11, 31, 23, 59, 59, 999),
          },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
      });

      const monthlyReport = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalAmount: 0,
      }));

      for (const order of orders) {
        const monthIndex = new Date(order.createdAt).getMonth();
        monthlyReport[monthIndex].totalAmount += order.totalAmount;
      }

      res.json(monthlyReport);
    } catch (err) {
      console.error("salesMonthly error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async salesByCategory(req: Request, res: Response) {
    try {
      const { year, month, storeId } = req.query;
      const user = req.user;

      if (!user) res.status(401).json({ error: "Unauthorized" });

      const parsedYear = parseInt(year as string);
      const parsedMonth = parseInt(month as string);
      if (isNaN(parsedYear) || isNaN(parsedMonth)) {
         res.status(400).json({ error: "Tahun dan bulan diperlukan" });
      }

      let filterStoreId: string | undefined = undefined;
      if (user && user.role === "super_admin") {
        filterStoreId = storeId as string | undefined;
      } else if (user) {
        filterStoreId = (user as any).storeId;
      }

      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: {
            status: { in: ["PAID", "COMPLETED"] },
            ...(filterStoreId ? { storeId: filterStoreId } : {}),
            createdAt: {
              gte: new Date(parsedYear, parsedMonth - 1, 1),
              lt: new Date(parsedYear, parsedMonth, 1),
            },
          },
        },
        include: {
          product: { include: { category: true } },
        },
      });

      const result: Record<string, { category: string; totalSold: number; totalRevenue: number }> = {};

      for (const item of orderItems) {
        const category = item.product.category?.name ?? "Uncategorized";
        if (!result[category]) {
          result[category] = { category, totalSold: 0, totalRevenue: 0 };
        }
        result[category].totalSold += item.quantity;
        result[category].totalRevenue += item.quantity * item.price;
      }

      res.json(Object.values(result));
    } catch (err) {
      console.error("salesByCategory error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async salesByProduct(req: Request, res: Response) {
    try {
      const { year, month, storeId } = req.query;
      const user = req.user;

      if (!user)  res.status(401).json({ error: "Unauthorized" });

      const parsedYear = parseInt(year as string);
      const parsedMonth = parseInt(month as string);
      if (isNaN(parsedYear) || isNaN(parsedMonth)) {
         res.status(400).json({ error: "Tahun dan bulan diperlukan" });
      }

      let filterStoreId: string | undefined = undefined;
      if (user && user.role === "super_admin") {
        filterStoreId = storeId as string | undefined;
      } else if (user) {
        filterStoreId = (user as any).storeId;
      }

      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: {
            status: { in: ["PAID", "COMPLETED"] },
            ...(filterStoreId ? { storeId: filterStoreId } : {}),
            createdAt: {
              gte: new Date(parsedYear, parsedMonth - 1, 1),
              lt: new Date(parsedYear, parsedMonth, 1),
            },
          },
        },
        include: { product: true },
      });

      const result: Record<string, { productId: string; name: string; totalSold: number; totalRevenue: number }> = {};

      for (const item of orderItems) {
        const product = item.product;
        if (!result[product.id]) {
          result[product.id] = {
            productId: product.id,
            name: product.name,
            totalSold: 0,
            totalRevenue: 0,
          };
        }
        result[product.id].totalSold += item.quantity;
        result[product.id].totalRevenue += item.quantity * item.price;
      }

      res.json(Object.values(result));
    } catch (err) {
      console.error("salesByProduct error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async stockSummary(req: Request, res: Response) {
    try {
      const { year, month, storeId } = req.query;
      const user = req.user;

      if (!user)  res.status(401).json({ error: "Unauthorized" });
      if (!year || !month)  res.status(400).json({ error: "Tahun dan bulan diperlukan" });

      const parsedYear = parseInt(year as string);
      const parsedMonth = parseInt(month as string);
      if (isNaN(parsedYear) || isNaN(parsedMonth)) {
         res.status(400).json({ error: "Tahun dan bulan tidak valid" });
      }

      let filterStoreId: string | undefined;
      if (user && user.role === "super_admin") {
        filterStoreId = storeId as string | undefined;
      } else if (user) {
        filterStoreId = (user as any).storeId;
      }

      const histories = await prisma.stockHistory.findMany({
        where: {
          ...(filterStoreId ? { storeId: filterStoreId } : {}),
          createdAt: {
            gte: new Date(parsedYear, parsedMonth - 1, 1),
            lt: new Date(parsedYear, parsedMonth, 1),
          },
        },
      });

      let totalAdd = 0;
      let totalRemove = 0;

      for (const h of histories) {
        if (h.type === "ADD") totalAdd += h.quantity;
        else if (h.type === "REMOVE") totalRemove += h.quantity;
      }

      const productStocks = await prisma.productStock.findMany({
        where: filterStoreId ? { storeId: filterStoreId } : {},
      });

      const result = {
        totalAdded: totalAdd,
        totalRemoved: totalRemove,
        stockEnding: productStocks.reduce((sum, s) => sum + s.quantity, 0),
      };

      res.json(result);
    } catch (err) {
      console.error("stockSummary error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async salesStockHistory(req: Request, res: Response) {
    try {
      const { year, month, storeId, productId } = req.query;
      const user = req.user;

      if (!year || !month) {
         res.status(400).json({ error: "Tahun dan bulan diperlukan" });
      }

      const parsedYear = parseInt(year as string);
      const parsedMonth = parseInt(month as string);

      let filterStoreId: string | undefined;
      if (user?.role === "super_admin") {
        filterStoreId = storeId as string | undefined;
      } else {
        filterStoreId = (user as any).storeId;
      }

      const histories = await prisma.stockHistory.findMany({
        where: {
          ...(filterStoreId ? { storeId: filterStoreId } : {}),
          ...(productId ? { productId: productId as string } : {}),
          createdAt: {
            gte: new Date(parsedYear, parsedMonth - 1, 1),
            lte: new Date(parsedYear, parsedMonth, 0, 23, 59, 59),
          },
        },
        include: {
          product: true,
        },
      });

      const formatted = histories.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        type: item.type,
        quantity: item.quantity,
        description: item.description,
        date: item.createdAt,
      }));

      res.json(formatted);
    } catch (error) {
      console.error("salesStockHistory error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async removeStock(req: Request, res: Response) {
  try {
    const { productId, storeId, quantity, description } = req.body;
    const user = req.user;

    if (!user)  res.status(401).json({ error: "Unauthorized" });
    if (!productId || !quantity || !description) {
       res.status(400).json({ error: "Data tidak lengkap" });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
       res.status(400).json({ error: "Jumlah tidak valid" });
    }

    // Cek storeId berdasarkan role
    let targetStoreId = storeId;
    if (!user || user.role !== "super_admin") {
      targetStoreId = (user as any).storeId;
    }
    if (!targetStoreId) {
       res.status(400).json({ error: "Store ID diperlukan" });
    }

    // Cek apakah stok cukup
    const existing = await prisma.productStock.findFirst({
      where: {
        productId,
        storeId: targetStoreId,
      },
    });

    if (!existing || existing.quantity < qty) {
       res.status(400).json({ error: "Stok tidak mencukupi" });
       return;
    }

    // Update stok
    const updated = await prisma.productStock.update({
      where: {
        id: existing.id,
      },
      data: {
        quantity: existing.quantity - qty,
      },
    });

    // Catat history
    await prisma.stockHistory.create({
      data: {
        productId,
        storeId: targetStoreId,
        quantity: qty,
        type: "REMOVE",
        description,
      },
    });

    res.json({
      message: "Stok berhasil dikurangi",
      updatedStock: updated,
    });
  } catch (err) {
    console.error("removeStock error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


}