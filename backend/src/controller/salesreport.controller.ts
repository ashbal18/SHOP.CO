import { Request, Response } from "express";
import prisma from "../prisma";

export class SalesReportController {
  // SALES REPORT

  async salesMonthly(req: Request, res: Response) {
    try {
      const { year, storeId } = req.query;
      const user = req.user;

      if (!user) res.status(401).json({ error: "Unauthorized" });
      if (!year) res.status(400).json({ error: "Tahun diperlukan" });

      const parsedYear = parseInt(year as string, 10);
      if (isNaN(parsedYear))  res.status(400).json({ error: "Tahun tidak valid" });

      const filterStoreId = storeId as string | undefined;

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

      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const parsedYear = parseInt(year as string, 10);
      const parsedMonth = parseInt(month as string, 10);
      if (isNaN(parsedYear) || isNaN(parsedMonth)) {
         res.status(400).json({ error: "Tahun dan bulan diperlukan" });
      }

      const filterStoreId = storeId as string | undefined;

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
          product: {
            include: { category: true },
          },
        },
      });

      const result: Record<
        string,
        { category: string; totalSold: number; totalRevenue: number }
      > = {};

      for (const item of orderItems) {
        const category = item.product.category?.name ?? "Uncategorized";
        if (!result[category]) {
          result[category] = {
            category,
            totalSold: 0,
            totalRevenue: 0,
          };
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

      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const parsedYear = parseInt(year as string, 10);
      const parsedMonth = parseInt(month as string, 10);
      if (isNaN(parsedYear) || isNaN(parsedMonth)) {
        res.status(400).json({ error: "Tahun dan bulan diperlukan" });
        return;
      }

      const filterStoreId =
        user.role === "admin" ? (storeId as string | undefined) : (storeId as string | undefined);

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
          product: true,
        },
      });

      const result: Record<
        string,
        { productId: string; name: string; totalSold: number; totalRevenue: number }
      > = {};

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
}
