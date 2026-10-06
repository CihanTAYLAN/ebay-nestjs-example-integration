import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server.js';

export class StoreController {
  // GET /api/v1/stores
  async getStores(req: Request, res: Response, next: NextFunction) {
    try {
      const stores = await prisma.store.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { products: true, categories: true, orders: true },
          },
        },
      });

      res.json({
        success: true,
        data: stores,
        total: stores.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/stores/:id
  async getStoreById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const store = await prisma.store.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { products: true, categories: true, orders: true },
          },
          products: {
            take: 5, // Limit for preview
            select: {
              id: true,
              sku: true,
              title: true,
              price: true,
              quantity: true,
            },
          },
        },
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          error: 'Store not found',
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        data: store,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/stores
  async createStore(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, userId, description, sandboxMode = true } = req.body;

      if (!name || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Name and userId are required',
          timestamp: new Date().toISOString(),
        });
      }

      const store = await prisma.store.create({
        data: {
          name,
          userId,
          description,
          sandboxMode,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: store,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/stores/:id
  async updateStore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      const store = await prisma.store.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json({
        success: true,
        data: store,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/stores/:id
  async deleteStore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.store.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Store deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const storeController = new StoreController();
