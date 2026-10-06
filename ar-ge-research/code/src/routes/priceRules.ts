import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// GET /api/v1/price-rules?storeId={storeId} - List price rules
router.get('/', async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        error: 'storeId query parameter is required',
        timestamp: new Date().toISOString(),
      });
    }

    // In a real implementation, this would fetch from database
    const priceRules = [
      {
        id: 'rule-1',
        name: 'Electronics Markup',
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: 15.0,
        priority: 1,
        storeId: storeId,
        categoryIds: ['cat-1'],
      },
    ];

    res.json({
      success: true,
      data: priceRules,
      total: priceRules.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price rules',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as priceRulesRoutes };
