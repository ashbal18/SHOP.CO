import { Request, Response } from "express";
import prisma from "../prisma";

export class RewardController {
  async getReward(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // pastikan middleware auth men-set req.user

      if (!userId) {
        res.status(401).json({ message: "Unauthorized!" });
      } else {
        const points = await prisma.poin.findMany({
          where: {
            userId: String(userId),
            expiredAt: {
              gt: new Date(), // poin belum expired
            },
          },
          select: {
            id: true,
            amount: true,
            expiredAt: true,
          },
        });

        const voucher = await prisma.voucher.findFirst({
          where: {
            userId: String(userId),
            used: false,
            expiredAt: {
              gt: new Date(),
            },
          },
          select: {
            id: true,
            code: true,
            percentage: true,
            maxDiscount: true,
            expiredAt: true,
          },
        });

        res.status(200).json({
          points,
          voucher,
        });
      }
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({ error: (error as Error).message || error });
      }
    }
  }
}
