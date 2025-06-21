import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "../../prisma/generated/client";
import { genSalt, hash } from "bcrypt";
import { cloudinaryRemove, cloudinaryUpload } from "../helpers/cloudinary";

export class UserController {
  async getUser(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const filter: Prisma.UserWhereInput = {};

      if (search && typeof search === "string") {
        filter.name = { contains: search, mode: "insensitive" };
      }

      const users = await prisma.user.findMany({
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
        },
      });

      const stats = await prisma.user.aggregate({
        _count: { _all: true },
        _max: { createdAt: true },
        _min: { createdAt: true },
      });

      res.status(200).json({
        message: "User data",
        users,
        stats,
      });
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: (err as Error).message || err });
    }
  }

  async getUserId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: "Missing user id" });
      } else {
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
            referralCode: true,
            referredById: true,
            isVerify: true,
            isPendingVerification: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          res.status(200).json({ message: "User detail", user });
        }
      }
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: (err as Error).message || err });
    }
  }

async updateUser(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
         res.status(401).json({ message: "Unauthorized" });
         return;
      }

      const userId = String(req.user.id);
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) {
         res.status(404).json({ message: "User not found" });
         return;
      }

      const data: Prisma.UserUpdateInput = req.body;

      // ✅ Handle password update
      if (typeof data.password === "string") {
        const salt = await genSalt(10);
        data.password = await hash(data.password, salt);
      }

      // ✅ Handle avatar upload
      if (req.file) {
        // Hapus avatar lama jika ada
        if (existingUser.avatar) {
          await cloudinaryRemove(existingUser.avatar);
        }

        // Upload avatar baru
        const uploadResult = await cloudinaryUpload(req.file, "ig");
        data.avatar = uploadResult.secure_url;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
      });

       res.status(200).json({ message: "User updated ✅", updatedUser });
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: (err as Error).message || err });
    }
  }


  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: "Missing user id" });
      } else {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          await prisma.user.delete({ where: { id } });
          res.status(200).json({ message: "User deleted ✅" });
        }
      }
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: (err as Error).message || err });
    }
  }

  async getUserDetailWithRelations(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: "Unauthorized" });
      } else {
        const user = await prisma.user.findUnique({
          where: { id: String(req.user.id) },
          include: {
            poin: true,
            vouchers: true,
            cartItems: true,
            orders: true,
            referredBy: {
              select: { id: true, name: true, email: true },
            },
            referrals: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        if (!user) {
          res.status(404).json({ message: "User not found" });
        } else {
          res.status(200).json({ message: "User detail with relations", user });
        }
      }
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: (err as Error).message || err });
    }
  }


}
  


