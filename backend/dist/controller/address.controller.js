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
exports.AddressController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AddressController {
    getAddresses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const addresses = yield prisma_1.default.address.findMany({
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
            }
            catch (err) {
                console.error(err);
                if (!res.headersSent)
                    res.status(500).json({ error: err.message || err });
            }
        });
    }
    getAddressById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { address_id } = req.params;
                if (!address_id) {
                    res.status(400).json({ message: "Missing address_id" });
                    return;
                }
                const address = yield prisma_1.default.address.findUnique({
                    where: { address_id },
                });
                if (!address) {
                    res.status(404).json({ message: "Address not found" });
                    return;
                }
                res.status(200).json({
                    message: "Address detail",
                    address: Object.assign(Object.assign({}, address), { city_id: address.destination_id }),
                });
            }
            catch (err) {
                console.error(err);
                if (!res.headersSent)
                    res.status(500).json({ error: err.message || err });
            }
        });
    }
    createAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const data = Object.assign(Object.assign({}, req.body), { id: userId, destination_id: req.body.destination_id || null });
                if (data.is_primary) {
                    yield prisma_1.default.address.updateMany({
                        where: { id: String(userId), is_primary: true },
                        data: { is_primary: false },
                    });
                }
                const newAddress = yield prisma_1.default.address.create({ data });
                res.status(201).json({
                    message: "Address created ✅",
                    newAddress: Object.assign(Object.assign({}, newAddress), { city_id: newAddress.destination_id }),
                });
            }
            catch (err) {
                console.error(err);
                if (!res.headersSent)
                    res.status(500).json({ error: err.message || err });
            }
        });
    }
    updateAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { address_id } = req.params;
                if (!address_id) {
                    res.status(400).json({ message: "Missing address_id" });
                    return;
                }
                const data = Object.assign(Object.assign({}, req.body), { destination_id: req.body.destination_id || null });
                if (data.is_primary === true) {
                    const old = yield prisma_1.default.address.findUnique({ where: { address_id } });
                    if (old && old.id) {
                        yield prisma_1.default.address.updateMany({
                            where: { id: old.id, is_primary: true },
                            data: { is_primary: false },
                        });
                    }
                }
                const updatedAddress = yield prisma_1.default.address.update({
                    where: { address_id },
                    data,
                });
                res.status(200).json({
                    message: "Address updated ✅",
                    updatedAddress: Object.assign(Object.assign({}, updatedAddress), { city_id: updatedAddress.destination_id }),
                });
            }
            catch (err) {
                console.error(err);
                if (!res.headersSent)
                    res.status(500).json({ error: err.message || err });
            }
        });
    }
    deleteAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { address_id } = req.params;
                if (!address_id) {
                    res.status(400).json({ message: "Missing address_id" });
                    return;
                }
                const address = yield prisma_1.default.address.findUnique({
                    where: { address_id },
                });
                if (!address) {
                    res.status(404).json({ message: "Address not found" });
                    return;
                }
                yield prisma_1.default.address.delete({ where: { address_id } });
                res.status(200).json({ message: "Address deleted ✅" });
            }
            catch (err) {
                console.error(err);
                if (!res.headersSent)
                    res.status(500).json({ error: err.message || err });
            }
        });
    }
}
exports.AddressController = AddressController;
