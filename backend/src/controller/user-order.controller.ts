import { Request, Response } from "express";
import prisma from "../prisma";

export class OrderController {
 async getUserTransactions(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = String(req.user.id);

    const transactions = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        voucher: true,
        store: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "User transactions fetched successfully ✅",
      transactions,
    });
  } catch (err) {
    console.error("Error fetching user transactions:", err);
    if (!res.headersSent)
      res.status(500).json({ error: (err as Error).message || err });
  }
}
}
