import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "../../prisma/generated/client";

export class AddressController {
  async getAddresses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const addresses = await prisma.address.findMany({
        where: { id: String(userId) },
        orderBy: { created_at: "desc" },
        select: {
          address_id: true,
          address_name: true,
          address: true,
          city: true,
          province: true,
          is_primary: true,
          destination_id: true, // Ambil dari DB
        },
      });

      const formatted = addresses.map((a) => ({
        address_id: a.address_id,
        address_name: a.address_name,
        address: a.address,
        city: a.city,
        province: a.province,
        is_primary: a.is_primary,
        city_id: a.destination_id || "", // Rename jadi city_id
      }));

      res.status(200).json({
        message: "Address list",
        addresses: formatted,
      });
    } catch (err) {
      console.error(err);
      if (!res.headersSent)
        res.status(500).json({ error: (err as Error).message || err });
    }
  }

  async getAddressById(req: Request, res: Response): Promise<void> {
    try {
      const { address_id } = req.params;
      if (!address_id) {
        res.status(400).json({ message: "Missing address_id" });
        return;
      }

      const address = await prisma.address.findUnique({
        where: { address_id },
      });

      if (!address) {
        res.status(404).json({ message: "Address not found" });
        return;
      }

      res.status(200).json({
        message: "Address detail",
        address: {
          ...address,
          city_id: address.destination_id,
        },
      });
    } catch (err) {
      console.error(err);
      if (!res.headersSent)
        res.status(500).json({ error: (err as Error).message || err });
    }
  }

  async createAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const data: Prisma.AddressCreateInput = {
        ...req.body,
        id: userId,
        destination_id: req.body.destination_id || null,
      };

      if (data.is_primary) {
        await prisma.address.updateMany({
          where: { id: String(userId), is_primary: true },
          data: { is_primary: false },
        });
      }

      const newAddress = await prisma.address.create({ data });

      res.status(201).json({
        message: "Address created ✅",
        newAddress: {
          ...newAddress,
          city_id: newAddress.destination_id,
        },
      });
    } catch (err) {
      console.error(err);
      if (!res.headersSent)
        res.status(500).json({ error: (err as Error).message || err });
    }
  }

  async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const { address_id } = req.params;
      if (!address_id) {
        res.status(400).json({ message: "Missing address_id" });
        return;
      }

      const data: Prisma.AddressUpdateInput = {
        ...req.body,
        destination_id: req.body.destination_id || null,
      };

      if (data.is_primary === true) {
        const old = await prisma.address.findUnique({ where: { address_id } });
        if (old && old.id) {
          await prisma.address.updateMany({
            where: { id: old.id, is_primary: true },
            data: { is_primary: false },
          });
        }
      }

      const updatedAddress = await prisma.address.update({
        where: { address_id },
        data,
      });

      res.status(200).json({
        message: "Address updated ✅",
        updatedAddress: {
          ...updatedAddress,
          city_id: updatedAddress.destination_id,
        },
      });
    } catch (err) {
      console.error(err);
      if (!res.headersSent)
        res.status(500).json({ error: (err as Error).message || err });
    }
  }

  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const { address_id } = req.params;
      if (!address_id) {
        res.status(400).json({ message: "Missing address_id" });
        return;
      }

      const address = await prisma.address.findUnique({
        where: { address_id },
      });
      if (!address) {
        res.status(404).json({ message: "Address not found" });
        return;
      }

      await prisma.address.delete({ where: { address_id } });

      res.status(200).json({ message: "Address deleted ✅" });
    } catch (err) {
      console.error(err);
      if (!res.headersSent)
        res.status(500).json({ error: (err as Error).message || err });
    }
  }
}
