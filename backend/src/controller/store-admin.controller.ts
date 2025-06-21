import { Request, Response } from "express";
import prisma from "../prisma";

export class AdminController {
  static getStoreAdmins(arg0: string, getStoreAdmins: any) {
    throw new Error("Method not implemented.");
  }

  async getAllStoreAdmins(req: Request, res: Response) {
    try {
      // Cek apakah user yang mengakses adalah super_admin, jika tidak, akan ditangani oleh middleware
      const storeAdmins = await prisma.user.findMany({
        where: { roles: "ADMIN" },
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          createdAt: true,
          Address: {
            select: {
              address: true,
              city: true,
              province: true,
            },
          },
        },
      });

      res.status(200).json(storeAdmins);
    } catch (error) {
      console.error("Error getting store admins:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getStoreAdmins(req: Request, res: Response) {
    try {
      const storeAdmins = await prisma.user.findMany({
        where: { roles: "ADMIN" },
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
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

      res.status(200).json(storeAdmins);
    } catch (error) {
      console.error("Error getting store admins:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

   async updateStoreAdmin(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { name, email } = req.body;

      const updatedAdmin = await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
        },
      });

      res.status(200).json(updatedAdmin);
    } catch (error) {
      console.error("Error updating store admin:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
 async deleteStoreAdmin(req: Request, res: Response) {
    try {
      const id = req.params.id;

      await prisma.user.delete({
        where: { id },
      });

      res.status(200).json({ message: "Store admin deleted successfully" });
    } catch (error) {
      console.error("Error deleting store admin:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

