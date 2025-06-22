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
exports.StoreAdminsController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class StoreAdminsController {
    getAdmins(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search } = req.query;
                const filter = {
                    roles: { in: ["ADMIN", "SUPER_ADMIN"] },
                };
                if (search && typeof search === "string") {
                    filter.name = { contains: search, mode: "insensitive" };
                }
                const admins = yield prisma_1.default.user.findMany({
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
                const stats = yield prisma_1.default.user.aggregate({
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
            }
            catch (err) {
                console.error(err);
                if (!res.headersSent)
                    res.status(500).json({ error: err.message || err });
            }
        });
    }
    getAdminById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    res.status(400).json({ message: "Missing user id" });
                }
                else {
                    const admin = yield prisma_1.default.user.findUnique({
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
                    }
                    else if (!["ADMIN", "SUPER_ADMIN"].includes(admin.roles)) {
                        res.status(403).json({ message: "User is not a store admin" });
                    }
                    else {
                        res.status(200).json({ message: "Store admin detail", admin });
                    }
                }
            }
            catch (err) {
                console.error(err);
                if (!res.headersSent)
                    res.status(500).json({ error: err.message || err });
            }
        });
    }
}
exports.StoreAdminsController = StoreAdminsController;
