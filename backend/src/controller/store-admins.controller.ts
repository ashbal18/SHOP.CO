import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "../../prisma/generated/client";

export class StoreAdminsController {
  async getAdmins(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const filter: Prisma.UserWhereInput = {
        roles: { in: ["ADMIN", "SUPER_ADMIN"] },
      };

      if (search && typeof search === "string") {
        filter.name = { contains: search, mode: "insensitive" };
      }

      const admins = await prisma.user.findMany({
        where: filter,
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          avatar: true,
          isVerify: true,
          createdAt: true,
          store: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      });

      const stats = await prisma.user.aggregate({
        where: filter,
        _count: { _all: true },
        _max: { createdAt: true },
        _min: { createdAt: true },
      });

      res.status(200).json({
        message: "Store admin data",
        admins,
        stats,
      });
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: (err as Error).message || err });
    }
  }

  async getAdminById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: "Missing user id" });
      } else {
        const admin = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
            avatar: true,
            isVerify: true,
            isPendingVerification: true,
            referralCode: true,
            referredById: true,
            createdAt: true,
            updatedAt: true,
            store: {
              select: {
                id: true,
                name: true,
                address: true,
                createdAt: true,
              },
            },
          },
        });

        if (!admin) {
          res.status(404).json({ message: "Admin store not found" });
        } else if (!["ADMIN", "SUPER_ADMIN"].includes(admin.roles)) {
          res.status(403).json({ message: "User is not a store admin" });
        } else {
          res.status(200).json({ message: "Store admin detail", admin });
        }
      }
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: (err as Error).message || err });
    }
  }
}
