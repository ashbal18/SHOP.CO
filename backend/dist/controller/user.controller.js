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
exports.UserController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcrypt_1 = require("bcrypt");
const cloudinary_1 = require("../helpers/cloudinary");
class UserController {
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search } = req.query;
                const filter = {};
                if (search && typeof search === "string") {
                    filter.name = { contains: search, mode: "insensitive" };
                }
                const users = yield prisma_1.default.user.findMany({
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
                const stats = yield prisma_1.default.user.aggregate({
                    _count: { _all: true },
                    _max: { createdAt: true },
                    _min: { createdAt: true },
                });
                res.status(200).json({
                    message: "User data",
                    users,
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
    getUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    res.status(400).json({ message: "Missing user id" });
                }
                else {
                    const user = yield prisma_1.default.user.findUnique({
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
                    }
                    else {
                        res.status(200).json({ message: "User detail", user });
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
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = String(req.user.id);
                const existingUser = yield prisma_1.default.user.findUnique({ where: { id: userId } });
                if (!existingUser) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                const data = req.body;
                // ✅ Handle password update
                if (typeof data.password === "string") {
                    const salt = yield (0, bcrypt_1.genSalt)(10);
                    data.password = yield (0, bcrypt_1.hash)(data.password, salt);
                }
                // ✅ Handle avatar upload
                if (req.file) {
                    // Hapus avatar lama jika ada
                    if (existingUser.avatar) {
                        yield (0, cloudinary_1.cloudinaryRemove)(existingUser.avatar);
                    }
                    // Upload avatar baru
                    const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "ig");
                    data.avatar = uploadResult.secure_url;
                }
                const updatedUser = yield prisma_1.default.user.update({
                    where: { id: userId },
                    data,
                });
                res.status(200).json({ message: "User updated ✅", updatedUser });
            }
            catch (err) {
                console.error(err);
                if (!res.headersSent)
                    res.status(500).json({ error: err.message || err });
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    res.status(400).json({ message: "Missing user id" });
                }
                else {
                    const user = yield prisma_1.default.user.findUnique({ where: { id } });
                    if (!user) {
                        res.status(404).json({ message: "User not found" });
                    }
                    else {
                        yield prisma_1.default.user.delete({ where: { id } });
                        res.status(200).json({ message: "User deleted ✅" });
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
    getUserDetailWithRelations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    res.status(401).json({ message: "Unauthorized" });
                }
                else {
                    const user = yield prisma_1.default.user.findUnique({
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
                    }
                    else {
                        res.status(200).json({ message: "User detail with relations", user });
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
exports.UserController = UserController;
