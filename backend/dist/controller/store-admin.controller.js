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
exports.AdminController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AdminController {
    static getStoreAdmins(arg0, getStoreAdmins) {
        throw new Error("Method not implemented.");
    }
    getAllStoreAdmins(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Cek apakah user yang mengakses adalah super_admin, jika tidak, akan ditangani oleh middleware
                const storeAdmins = yield prisma_1.default.user.findMany({
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
            }
            catch (error) {
                console.error("Error getting store admins:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    getStoreAdmins(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const storeAdmins = yield prisma_1.default.user.findMany({
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
            }
            catch (error) {
                console.error("Error getting store admins:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    updateStoreAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { name, email } = req.body;
                const updatedAdmin = yield prisma_1.default.user.update({
                    where: { id },
                    data: {
                        name,
                        email,
                    },
                });
                res.status(200).json(updatedAdmin);
            }
            catch (error) {
                console.error("Error updating store admin:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    deleteStoreAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield prisma_1.default.user.delete({
                    where: { id },
                });
                res.status(200).json({ message: "Store admin deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting store admin:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
}
exports.AdminController = AdminController;
