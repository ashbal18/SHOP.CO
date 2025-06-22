"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
class AuthMiddleware {
    verifyToken(req, res, next) {
        var _a;
        try {
            const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            if (!token)
                throw { message: "Unauthorize!" };
            const verifiedUser = (0, jsonwebtoken_1.verify)(token, process.env.KEY_JWT);
            req.user = verifiedUser;
            next();
        }
        catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    }
    verifyAdmin(req, res, next) {
        var _a;
        try {
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin")
                throw { message: "Admin only" };
            next();
        }
        catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    }
    verifySuperAdmin(req, res, next) {
        var _a;
        try {
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "super_admin")
                throw { message: "SUPER_ADMIN only" };
            next();
        }
        catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
