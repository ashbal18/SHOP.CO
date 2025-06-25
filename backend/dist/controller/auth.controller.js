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
exports.AuthController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const mailer_1 = require("../helpers/mailer");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
class AuthController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let errorMessage = null;
            let statusCode = 200;
            try {
                const { email, password, name, role, referralCode } = req.body;
                const existing = yield prisma_1.default.user.findUnique({ where: { email } });
                if (existing) {
                    errorMessage = "Email already registered";
                    statusCode = 400;
                }
                else {
                    // Hash the password
                    const salt = yield (0, bcrypt_1.genSalt)(10);
                    const hashedPass = yield (0, bcrypt_1.hash)(password, salt);
                    const newReferralCode = Math.random().toString(36).substring(2, 10);
                    const user = yield prisma_1.default.user.create({
                        data: {
                            name,
                            email,
                            password: hashedPass,
                            referralCode: newReferralCode,
                            roles: role || "CUSTOMER",
                        },
                    });
                    const payload = { id: user.id, role: user.roles };
                    const token = (0, jsonwebtoken_1.sign)(payload, process.env.KEY_JWT, { expiresIn: "10m" });
                    const link = `${process.env.URL_FE}/verify/${token}`;
                    // Check if the user provided a valid referral code
                    if (referralCode) {
                        // Find the referrer user (User A)
                        const referrer = yield prisma_1.default.user.findUnique({
                            where: { referralCode },
                        });
                        // If referrer exists, give points to the referrer and voucher to the new user
                        if (referrer) {
                            // Add points to the referrer (User A)
                            yield prisma_1.default.poin.create({
                                data: {
                                    userId: referrer.id,
                                    amount: 10, // Assign 10 points for the referral
                                    expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Set points expiry (1 year)
                                },
                            });
                            // Create a voucher for the new user (User B)
                            yield prisma_1.default.voucher.create({
                                data: {
                                    userId: user.id,
                                    code: Math.random().toString(36).substring(2, 10), // Generate a random voucher code
                                    percentage: 10, // 10% discount
                                    maxDiscount: 50000, // Maximum discount of 50,000 units
                                    expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Voucher valid for 30 days
                                    used: false,
                                },
                            });
                        }
                    }
                    // Determine the email template based on the user's role
                    let templateName = "";
                    if (user.roles === "ADMIN") {
                        templateName = "verifyAdmin.hbs";
                    }
                    else if (user.roles === "SUPER_ADMIN") {
                        templateName = "verifySuperAdmin.hbs";
                    }
                    else {
                        templateName = "verify.hbs"; // Default to customer template
                    }
                    const templatePath = path_1.default.join(__dirname, "../templates", templateName);
                    const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                    const compiledTemplate = handlebars_1.default.compile(templateSource);
                    const html = compiledTemplate({ name, link });
                    yield mailer_1.transporter.sendMail({
                        from: process.env.GMAIL_USER,
                        to: email,
                        subject: "Verification Email",
                        html,
                    });
                    // Send the success response after everything is done
                    res.status(201).send({ message: "User created ✅" });
                }
            }
            catch (err) {
                console.error(err);
                errorMessage = "Registration failed";
                statusCode = 400;
            }
            // If any error occurred, send the error message
            if (errorMessage) {
                res.status(statusCode).send({ message: errorMessage });
            }
        });
    }
    // Login method
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield prisma_1.default.user.findUnique({
                    where: { email },
                });
                if (!user) {
                    res.status(404).send({ message: "User not found" });
                    return;
                }
                if (!user.isVerify) {
                    res.status(401).send({ message: "Account not verified" });
                    return;
                }
                const isValidPass = yield (0, bcrypt_1.compare)(password, user.password);
                if (!isValidPass) {
                    res.status(401).send({ message: "Incorrect password" });
                }
                // Cari store berdasarkan adminId
                const store = yield prisma_1.default.store.findUnique({
                    where: { adminId: user.id },
                });
                const storeId = (store === null || store === void 0 ? void 0 : store.id) || null;
                const payload = {
                    id: user.id,
                    role: user.roles,
                    storeId, // masukkan ke JWT
                };
                const access_token = (0, jsonwebtoken_1.sign)(payload, process.env.KEY_JWT, {
                    expiresIn: "1h",
                });
                res.status(200).send({
                    message: "Login successfully!",
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.roles,
                        avatar: user.avatar || "",
                        referralCode: user.referralCode,
                        storeId, // masukkan ke response client
                    },
                    access_token,
                });
            }
            catch (err) {
                console.error("Login error:", err);
                res.status(400).send({ message: "Login failed", error: err });
            }
        });
    }
    // Verification method
    verify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                yield prisma_1.default.user.update({
                    data: { isVerify: true },
                    where: { id: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString() },
                });
                res.status(200).send({ message: "Verification success!" });
            }
            catch (err) {
                console.error(err);
                res.status(400).send({ message: "Verification failed", error: err });
            }
        });
    }
    // Request password reset
    requestPasswordReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                // Check if the user exists
                const user = yield prisma_1.default.user.findUnique({ where: { email } });
                if (!user) {
                    res.status(404).send({ message: "User not found" });
                    return;
                }
                // Create reset token (valid for 1 hour)
                const resetToken = (0, jsonwebtoken_1.sign)({ email: user.email }, process.env.KEY_JWT, {
                    expiresIn: "1h", // Token valid for 1 hour
                });
                // Generate the reset link
                const resetLink = `${process.env.URL_FE}/reset-password/${resetToken}`;
                const templatePath = path_1.default.join(__dirname, "../templates", "resetpass.hbs");
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(templateSource);
                const html = compiledTemplate({
                    name: user.name, // Pass user's name
                    resetLink, // Pass reset link with token
                });
                yield mailer_1.transporter.sendMail({
                    from: process.env.GMAIL_USER,
                    to: email,
                    subject: "Password Reset Request",
                    html,
                });
                res.status(200).send({
                    message: "Password reset email sent successfully. Please check your inbox.",
                });
            }
            catch (err) {
                console.error(err);
                res.status(500).send({ message: "Server error during reset request" });
            }
        });
    }
    // Verify password reset and update password
    verifyPasswordReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
                if (!token) {
                    res.status(400).send({ message: "Token is required" });
                }
                else {
                    const { password, confirmPassword } = req.body;
                    if (password !== confirmPassword) {
                        res.status(400).send({ message: "Passwords do not match" });
                    }
                    else {
                        const decoded = (0, jsonwebtoken_1.verify)(token, process.env.KEY_JWT);
                        const user = yield prisma_1.default.user.findUnique({ where: { email: decoded.email } });
                        if (!user) {
                            res.status(400).send({ message: "Invalid password reset token" });
                        }
                        else {
                            // Hash the new password
                            const salt = yield (0, bcrypt_1.genSalt)(10);
                            const hashedPassword = yield (0, bcrypt_1.hash)(password, salt);
                            // Update the user's password
                            yield prisma_1.default.user.update({
                                where: { email: decoded.email },
                                data: { password: hashedPassword },
                            });
                            // Send password reset success response
                            res.status(200).send({ message: "Password reset successfully" });
                        }
                    }
                }
            }
            catch (err) {
                console.error(err);
                // Send error response if something goes wrong
                res.status(500).send({ message: "Error resetting password" });
            }
        });
    }
    loginOrRegisterWithGoogle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, name, avatar } = req.body;
                if (!email || !name) {
                    res.status(400).json({ message: "Missing required Google user data" });
                }
                let user = yield prisma_1.default.user.findUnique({ where: { email } });
                // Jika user belum terdaftar, lakukan register
                if (!user) {
                    user = yield prisma_1.default.user.create({
                        data: {
                            name,
                            email,
                            password: Math.random().toString(36).slice(-8), // Random password
                            isVerify: true,
                            roles: "CUSTOMER", // Pastikan role CUSTOMER
                            avatar,
                            referralCode: Math.random().toString(36).substring(2, 10),
                        },
                    });
                }
                // Jika user sudah ada tapi role tidak ada, update jadi CUSTOMER
                if (!user.roles) {
                    user = yield prisma_1.default.user.update({
                        where: { email },
                        data: { roles: "CUSTOMER" },
                    });
                }
                // Buat JWT token
                const payload = { id: user.id, role: user.roles };
                const access_token = (0, jsonwebtoken_1.sign)(payload, process.env.KEY_JWT, {
                    expiresIn: "1h",
                });
                res.status(200).json({
                    message: "Login with Google successful",
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.roles,
                        avatar: user.avatar,
                        referralCode: user.referralCode,
                    },
                    access_token,
                });
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ message: "Google login failed", error: err });
            }
        });
    }
}
exports.AuthController = AuthController;
