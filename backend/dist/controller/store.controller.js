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
exports.StoreController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class StoreController {
    // Create Store
    createStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, address, adminId, city_id, latitude, longitude } = req.body;
                if (!name || !address || !adminId || !city_id || !latitude || !longitude) {
                    res.status(400).json({
                        error: 'Missing required fields: name, address, adminId, city_id, latitude, longitude',
                    });
                }
                const adminUser = yield prisma_1.default.user.findUnique({
                    where: { id: adminId },
                });
                if (!adminUser || adminUser.roles !== 'ADMIN') {
                    res
                        .status(400)
                        .json({ error: 'adminId invalid atau user bukan ADMIN' });
                }
                const existingStore = yield prisma_1.default.store.findFirst({
                    where: { adminId },
                });
                if (existingStore) {
                    res
                        .status(400)
                        .json({ error: 'Store untuk admin ini sudah ada' });
                }
                const newStore = yield prisma_1.default.store.create({
                    data: {
                        name,
                        address,
                        adminId,
                        city_id,
                        latitude,
                        longitude,
                    },
                });
                res.status(201).json(newStore);
            }
            catch (error) {
                console.error('Error creating store:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // Get all stores with admin and product stocks
    getStores(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stores = yield prisma_1.default.store.findMany({
                    include: {
                        admin: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                roles: true,
                                avatar: true,
                            },
                        },
                        products: {
                            include: {
                                product: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                });
                res.status(200).json(stores);
            }
            catch (error) {
                console.error('Error fetching stores:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // Get all products (optionally by storeId)
    getProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { storeId } = req.query;
                let storeIdStr;
                if (storeId) {
                    if (typeof storeId === 'string') {
                        storeIdStr = storeId;
                    }
                    else if (Array.isArray(storeId) && typeof storeId[0] === 'string') {
                        storeIdStr = storeId[0];
                    }
                    else {
                        res.status(400).json({ error: 'Invalid storeId' });
                    }
                }
                const productStocks = yield prisma_1.default.productStock.findMany({
                    where: storeIdStr ? { storeId: storeIdStr } : undefined,
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                        store: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                city_id: true,
                            },
                        },
                    },
                });
                res.status(200).json(productStocks);
            }
            catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // Update Store
    updateStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, address, adminId, city_id, latitude, longitude } = req.body;
                const store = yield prisma_1.default.store.findUnique({ where: { id } });
                if (!store) {
                    res.status(404).json({ error: 'Store not found' });
                }
                if (adminId) {
                    const adminUser = yield prisma_1.default.user.findUnique({
                        where: { id: adminId },
                    });
                    if (!adminUser || adminUser.roles !== 'ADMIN') {
                        res
                            .status(400)
                            .json({ error: 'adminId invalid atau user bukan ADMIN' });
                    }
                    const existingStore = yield prisma_1.default.store.findFirst({
                        where: {
                            adminId,
                            NOT: { id },
                        },
                    });
                    if (existingStore) {
                        res
                            .status(400)
                            .json({ error: 'Admin ini sudah memiliki store lain' });
                    }
                }
                const updatedStore = yield prisma_1.default.store.update({
                    where: { id },
                    data: {
                        name,
                        address,
                        adminId,
                        city_id,
                        latitude,
                        longitude,
                    },
                });
                res.status(200).json(updatedStore);
            }
            catch (error) {
                console.error('Error updating store:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // Delete Store
    deleteStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const store = yield prisma_1.default.store.findUnique({ where: { id } });
                if (!store) {
                    res.status(404).json({ error: 'Store not found' });
                }
                yield prisma_1.default.store.delete({ where: { id } });
                res.status(200).json({ message: 'Store deleted successfully' });
            }
            catch (error) {
                console.error('Error deleting store:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}
exports.StoreController = StoreController;
