"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const reward_controller_1 = require("../controller/reward.controller");
class RewardRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.rewardController = new reward_controller_1.RewardController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.router.get("/", this.authMiddleware.verifyToken, this.rewardController.getReward);
    }
    getRouter() {
        return this.router;
    }
}
exports.RewardRouter = RewardRouter;
