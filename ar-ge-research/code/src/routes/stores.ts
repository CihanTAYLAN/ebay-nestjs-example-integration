import { Router } from 'express';
import { prisma } from '../server.js';

const router = Router();

// GET /api/v1/stores - List all stores
router.get('/', async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    res.json({
      success: true,
      data: stores,
      total: stores.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stores',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/v1/stores/:id - Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { products: true, categories: true, orders: true },
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/v1/stores - Create new store
router.post('/', async (req, res) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to create store',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as storeRoutes };
