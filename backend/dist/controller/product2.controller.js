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
exports.ProductController2 = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class ProductController2 {
    constructor() {
        this.getNewArrivals = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Ambil produk terbaru, misalnya urutkan berdasarkan createdAt desc
                const products = yield prisma_1.default.product.findMany({
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 10, // ambil 10 produk terbaru
                    include: {
                        category: true,
                        stocks: {
                            include: {
                                store: true,
                            },
                        },
                        discount: true,
                    },
                });
                const now = new Date();
                const productsWithDetails = products.map((product) => {
                    const totalStock = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
                    const firstStock = product.stocks[0];
                    const store = (firstStock === null || firstStock === void 0 ? void 0 : firstStock.store) || null;
                    const discount = Array.isArray(product.discount) && product.discount.length > 0 ? product.discount[0] : null;
                    let finalPrice = product.price;
                    const isDiscountActive = discount &&
                        new Date(discount.startDate) <= now &&
                        new Date(discount.endDate) >= now;
                    if (isDiscountActive) {
                        if (discount.isPercentage) {
                            finalPrice = product.price - (product.price * discount.amount) / 100;
                        }
                        else {
                            finalPrice = product.price - discount.amount;
                        }
                        if (finalPrice < 0)
                            finalPrice = 0;
                    }
                    return Object.assign(Object.assign({}, product), { totalStock,
                        store, discount: isDiscountActive ? discount : null, finalPrice });
                });
                res.json(productsWithDetails);
            }
            catch (error) {
                console.error("Error while fetching new arrivals:", error);
                res.status(500).json({ message: "Failed to fetch new arrivals", error });
            }
        });
    }
}
exports.ProductController2 = ProductController2;
