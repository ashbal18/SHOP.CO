import { Request, Response } from "express";
import prisma from "../prisma";
import { compare, genSalt, hash } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { transporter } from "../helpers/mailer";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";

export class AuthController {

  
  async register(req: Request, res: Response) {
    let errorMessage = null; 
    let statusCode = 200; 

    try {
      const { email, password, name, role, referralCode } = req.body;

      
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        errorMessage = "Email already registered";
        statusCode = 400;
      } else {
        // Hash the password
        const salt = await genSalt(10);
        const hashedPass = await hash(password, salt);

        
        const newReferralCode = Math.random().toString(36).substring(2, 10);

       
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPass,
            referralCode: newReferralCode,
            roles: role || "CUSTOMER", 
          },
        });

        const payload = { id: user.id, role: user.roles };
        const token = sign(payload, process.env.KEY_JWT!, { expiresIn: "10m" });

        const link = `${process.env.URL_FE}/verify/${token}`;

        
        if (referralCode) {       
          const referrer = await prisma.user.findUnique({
            where: { referralCode },
          });

          
          if (referrer) { 
            await prisma.poin.create({
              data: {
                userId: referrer.id,
                amount: 10, 
                expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 
              },
            });

            
            await prisma.voucher.create({
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

        
        let templateName = "";
        if (user.roles === "ADMIN") {
          templateName = "verifyAdmin.hbs";
        } else if (user.roles === "SUPER_ADMIN") {
          templateName = "verifySuperAdmin.hbs";
        } else {
          templateName = "verify.hbs"; 
        }

        const templatePath = path.join(__dirname, "../templates", templateName);
        const templateSource = fs.readFileSync(templatePath, "utf-8");
        const compiledTemplate = handlebars.compile(templateSource);
        const html = compiledTemplate({ name, link });

        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: email,
          subject: "Verification Email",
          html,
        });

       
        res.status(201).send({ message: "User created ✅" });
      }
    } catch (err) {
      console.error(err);
      errorMessage = "Registration failed";
      statusCode = 400;
    }

    
    if (errorMessage) {
      res.status(statusCode).send({ message: errorMessage });
    }
  }

  // Login method
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
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

      const isValidPass = await compare(password, user.password);
      if (!isValidPass) {
        res.status(401).send({ message: "Incorrect password" });
      }

      // Cari store berdasarkan adminId
      const store = await prisma.store.findUnique({
        where: { adminId: user.id },
      });

      const storeId = store?.id || null;

      const payload = {
        id: user.id,
        role: user.roles,
        storeId, // masukkan ke JWT
      };

      const access_token = sign(payload, process.env.KEY_JWT!, {
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
    } catch (err) {
      console.error("Login error:", err);
      res.status(400).send({ message: "Login failed", error: err });
    }
  }


  // Verification method
  async verify(req: Request, res: Response) {
    try {
      await prisma.user.update({
        data: { isVerify: true },
        where: { id: req.user?.id?.toString() },
      });

      res.status(200).send({ message: "Verification success!" });
    } catch (err) {
      console.error(err);
      res.status(400).send({ message: "Verification failed", error: err });
    }
  }

   // Request password reset
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Check if the user exists
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        res.status(404).send({ message: "User not found" });
        return;
      }

      // Create reset token (valid for 1 hour)
      const resetToken = sign({ email: user.email }, process.env.KEY_JWT!, {
        expiresIn: "1h", // Token valid for 1 hour
      });

      // Generate the reset link
      const resetLink = `${process.env.URL_FE}/reset-password/${resetToken}`;

      const templatePath = path.join(__dirname, "../templates", "resetpass.hbs");
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({
        name: user.name, // Pass user's name
        resetLink, // Pass reset link with token
      });

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html,
      });

      res.status(200).send({
        message: "Password reset email sent successfully. Please check your inbox.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Server error during reset request" });
    }
  }

  // Verify password reset and update password
  async verifyPasswordReset(req: Request, res: Response) {
    try {
     
      const token = req.headers["authorization"]?.split(" ")[1]; 

      if (!token) {
        res.status(400).send({ message: "Token is required" });
      } else {
        const { password, confirmPassword } = req.body;


        if (password !== confirmPassword) {
          res.status(400).send({ message: "Passwords do not match" });
        } else {
          
          const decoded: any = verify(token as string, process.env.KEY_JWT!);

          
          const user = await prisma.user.findUnique({ where: { email: decoded.email } });

          if (!user) {
            
            res.status(400).send({ message: "Invalid password reset token" });
          } else {
            // Hash the new password
            const salt = await genSalt(10);
            const hashedPassword = await hash(password, salt);

            // Update the user's password
            await prisma.user.update({
              where: { email: decoded.email },
              data: { password: hashedPassword },
            });

            // Send password reset success response
            res.status(200).send({ message: "Password reset successfully" });
          }
        }
      }
    } catch (err) {
      console.error(err);
      // Send error response if something goes wrong
      res.status(500).send({ message: "Error resetting password" });
    }
  }
  async loginOrRegisterWithGoogle(req: Request, res: Response) {
    try {
      const { email, name, avatar } = req.body;

      // Validasi data wajib
      if (!email || !name) {
        res.status(400).json({ message: "Missing required Google user data" });
      }

      let user = await prisma.user.findUnique({ where: { email } });

      // Jika belum terdaftar, buat akun baru
      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            password: Math.random().toString(36).slice(-8), // Password acak
            isVerify: true,
            roles: "CUSTOMER",
            avatar,
            referralCode: Math.random().toString(36).substring(2, 10),
          },
        });
      }

      // Jika user sudah terdaftar tapi belum punya role
      if (!user.roles) {
        user = await prisma.user.update({
          where: { email },
          data: { roles: "CUSTOMER" },
        });
      }

      // Generate JWT token
      const payload = { id: user.id, role: user.roles };
      const access_token = sign(payload, process.env.KEY_JWT!, {
        expiresIn: "1h",
      });

      // Sukses response
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
    } catch (err) {
      console.error("[Google Auth Error]", err);
      res.status(500).json({ message: "Google login failed", error: err });
    }
  }
}
