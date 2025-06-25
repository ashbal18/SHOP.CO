"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const xendit_1 = __importDefault(require("../helpers/xendit"));
class TransactionController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, id } = req.query;
            try {
                const orders = yield prisma_1.default.order.findMany({
                    where: Object.assign(Object.assign({}, (userId && { userId: userId })), (id && { id: id })),
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
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ message: "Terjadi kesalahan", error: err });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { storeId, shippingAddress, items, totalAmount, voucherId } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId || !storeId || !items || !totalAmount || !shippingAddress) {
                    res.status(400).json({ message: "Data tidak lengkap" });
                }
                const address = yield prisma_1.default.address.findUnique({
                    where: { address_id: shippingAddress },
                });
                if (!address) {
                    res.status(404).json({ message: "Alamat tidak ditemukan" });
                }
                const fullAddress = `${address === null || address === void 0 ? void 0 : address.address_name}, ${address === null || address === void 0 ? void 0 : address.city}, ${address === null || address === void 0 ? void 0 : address.province}`;
                yield prisma_1.default.$transaction((txn) => __awaiter(this, void 0, void 0, function* () {
                    const order = yield txn.order.create({
                        data: {
                            userId: String(userId),
                            storeId,
                            shippingAddress: fullAddress,
                            totalAmount,
                            status: "PENDING_PAYMENT",
                            voucherId,
                            expiredAt: new Date(Date.now() + 60 * 60 * 1000),
                            items: {
                                create: items.map((item) => ({
                                    productId: item.productId,
                                    quantity: item.quantity,
                                    price: item.price,
                                })),
                            },
                        },
                    });
                    if (voucherId) {
                        yield txn.voucher.update({
                            where: { id: voucherId },
                            data: { used: true },
                        });
                    }
                    const invoiceData = {
                        externalId: order.id,
                        amount: totalAmount,
                        invoiceDuration: 3600,
                        description: `Pembayaran Order #${order.id}`,
                        currency: "IDR",
                        reminderTime: 1,
                        successRedirectUrl: "https://shop-co-frontend-one.vercel.app/",
                    };
                    const invoice = yield xendit_1.default.Invoice.createInvoice({ data: invoiceData });
                    yield txn.order.update({
                        where: { id: order.id },
                        data: { invoiceUrl: invoice.invoiceUrl },
                    });
                    res.status(201).json({ message: "Order berhasil dibuat", invoice });
                }));
            }
            catch (err) {
                console.error("Create order error:", err);
                res.status(500).json({ message: "Gagal membuat transaksi", error: err });
            }
        });
    }
    updateStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, external_id } = req.body;
                if (!status || !external_id) {
                    res.status(400).json({ message: "Missing status or external_id" });
                }
                // Jika pembayaran berhasil
                if (status === "PAID") {
                    yield prisma_1.default.$transaction((txn) => __awaiter(this, void 0, void 0, function* () {
                        const order = yield txn.order.update({
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
                            const stock = yield txn.productStock.findFirst({
                                where: {
                                    productId: item.productId,
                                    storeId: order.storeId,
                                },
                            });
                            if (!stock || stock.quantity < item.quantity) {
                                throw new Error(`Stok produk ${item.productId} tidak cukup`);
                            }
                            yield txn.productStock.update({
                                where: { id: stock.id },
                                data: { quantity: stock.quantity - item.quantity },
                            });
                        }
                    }));
                    res.status(200).json({ message: "Status updated to PAID and stock updated ✅" });
                }
                // Jika pembayaran gagal / kadaluarsa
                if (status === "EXPIRED") {
                    yield prisma_1.default.$transaction((txn) => __awaiter(this, void 0, void 0, function* () {
                        const order = yield txn.order.update({
                            where: { id: external_id },
                            data: { status: "EXPIRED" },
                        });
                        if (order.voucherId) {
                            yield txn.voucher.update({
                                where: { id: order.voucherId },
                                data: { used: false },
                            });
                        }
                    }));
                    res.status(200).json({ message: "Status updated to EXPIRED and voucher reset ✅" });
                }
                // Jika status bukan PAID/EXPIRED
                res.status(400).json({ message: `Status '${status}' is not handled` });
            }
            catch (err) {
                console.error("Update status error:", err);
                res.status(500).json({ message: "Failed to update status", error: err });
            }
        });
    }
}
exports.TransactionController = TransactionController;
