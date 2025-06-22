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
exports.RewardController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class RewardController {
    getReward(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // pastikan middleware auth men-set req.user
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized!" });
                }
                else {
                    const points = yield prisma_1.default.poin.findMany({
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
                    const voucher = yield prisma_1.default.voucher.findFirst({
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
            }
            catch (error) {
                console.error(error);
                if (!res.headersSent) {
                    res.status(500).json({ error: error.message || error });
                }
            }
        });
    }
}
exports.RewardController = RewardController;
