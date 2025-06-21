import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import crypto from 'crypto';

export class SuperAdminController {
  // Mendapatkan semua Store Admin hanya untuk super_admin
 // Tambahkan di SuperAdminController
async getSuperAdminProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id?.toString(); // pastikan middleware menambahkan user ke req
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Error fetching super admin profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


  // REGISTER Store Admin (Hanya dengan name, email, dan password)
  async createstoreadmin(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      // Validasi jika field name, email, atau password tidak ada
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Cek apakah email sudah terdaftar
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }

      // Hash password sebelum menyimpannya ke database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buat user baru
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roles: 'ADMIN',  
          isVerify: true,  
          isPendingVerification: false,
          referralCode: crypto.randomUUID(),  
        },
      });

      // Kirim respons dengan data user baru
      res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
      });
    } catch (error) {
      console.error('Error creating store admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async editStoreAdmin(req: Request, res: Response) {
  try {
    const superAdminId = req.user?.id?.toString();
    const { id } = req.params; // ID store admin yang akan diedit
    const { name, email } = req.body;

    // Cek apakah user yang melakukan permintaan adalah SUPER_ADMIN
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId },
    });

    if (!superAdmin || superAdmin.roles !== 'SUPER_ADMIN') {
       res.status(403).json({ error: 'Unauthorized' });
    }

    // Cek apakah user yang ingin diedit ada dan merupakan ADMIN
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate || userToUpdate.roles !== 'ADMIN') {
       res.status(404).json({ error: 'Store admin not found' });
    }

    // Siapkan data update
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await prisma.user.update({
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
  } catch (error) {
    console.error('Error editing store admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async deleteStoreAdmin(req: Request, res: Response) {
  try {
    const superAdminId = req.user?.id?.toString();
    const { id } = req.params;

    // Validasi bahwa request berasal dari SUPER_ADMIN
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId },
    });

    if (!superAdmin || superAdmin.roles !== 'SUPER_ADMIN') {
       res.status(403).json({ error: 'Unauthorized' });
    }

    // Pastikan user yang akan dihapus adalah ADMIN
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete || userToDelete.roles !== 'ADMIN') {
       res.status(404).json({ error: 'Store admin not found or not an ADMIN' });
    }

    // Hapus user
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Store admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting store admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
}
