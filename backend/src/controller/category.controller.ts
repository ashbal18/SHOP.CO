import { Request, Response } from "express";
import prisma from "../prisma";

export class CategoryController {
  createCategory = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name) {
         res.status(400).json({ error: "Missing required field: name" });
      }

      // Buat kategori baru
      const newCategory = await prisma.category.create({
        data: { name },
      });

      res.status(201).json(newCategory);
    } catch (error: any) {
      console.error("Error creating category:", error);

      // Kalau ada error unique constraint violation (name must be unique)
      if (error.code === 'P2002') {
         res.status(400).json({ error: "Category name already exists" });
      }

      res.status(500).json({ error: "Internal server error" });
    }
  };

  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await prisma.category.findMany({
        include: {
          products: true, // Jika mau, bisa sertakan produk yang ada di kategori ini
        },
      });
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  updateCategory = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { name } = req.body;

      if (!name) {
         res.status(400).json({ error: "Missing required field: name" });
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { name },
      });

      res.status(200).json(updatedCategory);
    } catch (error: any) {
      console.error("Error updating category:", error);
      if (error.code === 'P2025') {
         res.status(404).json({ error: "Category not found" });
      }
      if (error.code === 'P2002') {
         res.status(400).json({ error: "Category name already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  deleteCategory = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      await prisma.category.delete({
        where: { id },
      });

      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting category:", error);
      if (error.code === 'P2025') {
         res.status(404).json({ error: "Category not found" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
