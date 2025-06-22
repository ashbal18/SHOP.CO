"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controller/user.controller");
const uploader_1 = require("../helpers/uploader"); // import uploader
class UserRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userController = new user_controller_1.UserController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.router.get("/", this.authMiddleware.verifyToken, this.userController.getUser);
        this.router.get("/post", this.authMiddleware.verifyToken, this.userController.getUser);
        // PATCH /update-profile dengan upload avatar
        this.router.patch("/update-profile", this.authMiddleware.verifyToken, (0, uploader_1.uploader)("memoryStorage", "AVATAR_").single("avatar"), // <-- multer middleware
        this.userController.updateUser);
        //     this.router.patch(
        //   "/update-avatar",
        //   this.authMiddleware.verifyToken,
        //   this.userController.updateAvatar
        // );
        this.router.get("/:id", this.userController.getUserId);
        this.router.delete("/:id", this.authMiddleware.verifyToken, this.authMiddleware.verifySuperAdmin, this.userController.deleteUser);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRouter = UserRouter;
