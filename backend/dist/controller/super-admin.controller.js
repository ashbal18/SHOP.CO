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
exports.SuperAdminController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
const crypto_1 = __importDefault(require("crypto"));
class SuperAdminController {
    // Mendapatkan semua Store Admin hanya untuk super_admin
    // Tambahkan di SuperAdminController
    getSuperAdminProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString(); // pastikan middleware menambahkan user ke req
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        roles: true,
                        isVerify: true,
                    },
                });
                if (!user || user.roles !== 'SUPER_ADMIN') {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                res.status(200).json(user);
            }
            catch (error) {
                console.error('Error fetching super admin profile:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // REGISTER Store Admin (Hanya dengan name, email, dan password)
    createstoreadmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password } = req.body;
                // Validasi jika field name, email, atau password tidak ada
                if (!name || !email || !password) {
                    res.status(400).json({ error: 'Missing required fields' });
                    return;
                }
                // Cek apakah email sudah terdaftar
                const existingUser = yield prisma_1.default.user.findUnique({ where: { email } });
                if (existingUser) {
                    res.status(400).json({ error: 'Email already in use' });
                    return;
                }
                // Hash password sebelum menyimpannya ke database
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                // Buat user baru
                const newUser = yield prisma_1.default.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        roles: 'ADMIN',
                        isVerify: true,
                        isPendingVerification: false,
                        referralCode: crypto_1.default.randomUUID(),
                    },
                });
                // Kirim respons dengan data user baru
                res.status(201).json({
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    roles: newUser.roles,
                });
            }
            catch (error) {
                console.error('Error creating store admin:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    editStoreAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const superAdminId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                const { id } = req.params; // ID store admin yang akan diedit
                const { name, email } = req.body;
                // Cek apakah user yang melakukan permintaan adalah SUPER_ADMIN
                const superAdmin = yield prisma_1.default.user.findUnique({
                    where: { id: superAdminId },
                });
                if (!superAdmin || superAdmin.roles !== 'SUPER_ADMIN') {
                    res.status(403).json({ error: 'Unauthorized' });
                }
                // Cek apakah user yang ingin diedit ada dan merupakan ADMIN
                const userToUpdate = yield prisma_1.default.user.findUnique({
                    where: { id },
                });
                if (!userToUpdate || userToUpdate.roles !== 'ADMIN') {
                    res.status(404).json({ error: 'Store admin not found' });
                }
                // Siapkan data update
                const updateData = {};
                if (name)
                    updateData.name = name;
                if (email)
                    updateData.email = email;
                const updatedUser = yield prisma_1.default.user.update({
                    where: { id },
                    data: updateData,
                });
                res.status(200).json({
                    message: 'Store admin updated successfully',
                    user: {
                        name: updatedUser.name,
                        email: updatedUser.email,
                    },
                });
            }
            catch (error) {
                console.error('Error editing store admin:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    deleteStoreAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const superAdminId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                const { id } = req.params;
                // Validasi bahwa request berasal dari SUPER_ADMIN
                const superAdmin = yield prisma_1.default.user.findUnique({
                    where: { id: superAdminId },
                });
                if (!superAdmin || superAdmin.roles !== 'SUPER_ADMIN') {
                    res.status(403).json({ error: 'Unauthorized' });
                }
                // Pastikan user yang akan dihapus adalah ADMIN
                const userToDelete = yield prisma_1.default.user.findUnique({
                    where: { id },
                });
                if (!userToDelete || userToDelete.roles !== 'ADMIN') {
                    res.status(404).json({ error: 'Store admin not found or not an ADMIN' });
                }
                // Hapus user
                yield prisma_1.default.user.delete({
                    where: { id },
                });
                res.status(200).json({ message: 'Store admin deleted successfully' });
            }
            catch (error) {
                console.error('Error deleting store admin:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}
exports.SuperAdminController = SuperAdminController;
