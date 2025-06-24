import { Request, Response } from "express";
import prisma from "../prisma";
import { CreateInvoiceRequest } from "xendit-node/invoice/models";
import xenditClient from "../helpers/xendit";

export class TransactionController {
  async getAll(req: Request, res: Response) {
    const { userId, id } = req.query;
    try {
      const orders = await prisma.order.findMany({
        where: {
          ...(userId && { userId: userId as string }),
          ...(id && { id: id as string }),
        },
        include: {
          items: { include: { product: true } },
          voucher: true,
          store: true,
        },
        orderBy: { createdAt: "desc" },
      });

      res
        .status(200)
        .json({ message: "Data transaksi berhasil diambil", orders });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan", error: err });
    }
  }

  async create(req: Request, res: Response) {
  try {
    const { storeId, shippingAddress, items, totalAmount, voucherId, poinId, pointUsed } = req.body;
    const userId = req.user?.id;

    let message = "";
    let statusCode = 200;

    if (!userId || !storeId || !items || !totalAmount || !shippingAddress) {
      message = "Data tidak lengkap";
      statusCode = 400;
    }

    const address = await prisma.address.findUnique({
      where: { address_id: shippingAddress },
    });

    if (!address) {
      message = "Alamat tidak ditemukan";
      statusCode = 404;
    }

    if (message) {
      res.status(statusCode).json({ message });
      return;
    }

    if (!address) {
      throw new Error("Alamat tidak ditemukan");
    }
    const fullAddress = `${address.address_name}, ${address.city}, ${address.province}`;

    await prisma.$transaction(async (txn) => {
      // Validasi Poin
      let usedPoin = null;
      if (poinId) {
        usedPoin = await txn.poin.findFirst({
          where: {
            id: poinId,
            userId: userId?.toString(),
            used: false,
            expiredAt: { gt: new Date() },
          },
        });

        if (!usedPoin || usedPoin.amount < pointUsed) {
          throw new Error("Poin tidak valid atau jumlah tidak mencukupi");
        }
      }

      const order = await txn.order.create({
        data: {
          userId: userId!.toString(),
          storeId,
          shippingAddress: fullAddress,
          totalAmount,
          status: "PENDING_PAYMENT",
          voucherId,
          poinId,
          expiredAt: new Date(Date.now() + 60 * 60 * 1000),
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      if (voucherId) {
        await txn.voucher.update({
          where: { id: voucherId },
          data: { used: true },
        });
      }

      if (poinId) {
        await txn.poin.update({
          where: { id: poinId },
          data: { used: true },
        });
      }

      const invoiceData: CreateInvoiceRequest = {
        externalId: order.id,
        amount: totalAmount,
        invoiceDuration: 3600,
        description: `Pembayaran Order #${order.id}`,
        currency: "IDR",
        reminderTime: 1,
        successRedirectUrl: "https://shop-co-frontend-one.vercel.app/",
      };

      const invoice = await xenditClient.Invoice.createInvoice({ data: invoiceData });

      await txn.order.update({
        where: { id: order.id },
        data: { invoiceUrl: invoice.invoiceUrl },
      });

      res.status(201).json({ message: "Order berhasil dibuat", invoice });
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Gagal membuat transaksi", error: err });
  }
}


 async updateStatus(req: Request, res: Response) {
    try {
      const { status, external_id } = req.body;

      if (!status || !external_id) {
       res.status(400).json({ message: "Missing status or external_id" });
      }

      // Jika pembayaran berhasil
      if (status === "PAID") {
        await prisma.$transaction(async (txn) => {
          const order = await txn.order.update({
            where: { id: external_id },
            data: {
              status: "PAID",
              confirmedAt: new Date(),
            },
            include: {
              items: true, // ambil item untuk update stok
            },
          });

          for (const item of order.items) {
            const stock = await txn.productStock.findFirst({
              where: {
                productId: item.productId,
                storeId: order.storeId,
              },
            });

            if (!stock || stock.quantity < item.quantity) {
              throw new Error(`Stok produk ${item.productId} tidak cukup`);
            }

            await txn.productStock.update({
              where: { id: stock.id },
              data: { quantity: stock.quantity - item.quantity },
            });
          }
        });

        res.status(200).json({ message: "Status updated to PAID and stock updated ✅" });
      }

      // Jika pembayaran gagal / kadaluarsa
      if (status === "EXPIRED") {
        await prisma.$transaction(async (txn) => {
          const order = await txn.order.update({
            where: { id: external_id },
            data: { status: "EXPIRED" },
          });

          if (order.voucherId) {
            await txn.voucher.update({
              where: { id: order.voucherId },
              data: { used: false },
            });
          }
        });

        res.status(200).json({ message: "Status updated to EXPIRED and voucher reset ✅" });
      }

      // Jika status bukan PAID/EXPIRED
      res.status(400).json({ message: `Status '${status}' is not handled` });

    } catch (err) {
      console.error("Update status error:", err);
      res.status(500).json({ message: "Failed to update status", error: err });
    }
  }
}

