import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// GET /api/v1/templates?storeId={storeId} - List templates
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
    const templates = [
      {
        id: 'template-1',
        name: 'Standard Electronics Template',
        titleTemplate: '{{brand}} {{title}} - New Condition',
        descriptionTemplate:
          'Brand new {{title}} from {{brand}}. {{description}}',
        listingType: 'AUCTION_OR_FIXED_PRICE',
        duration: 'DAYS_7',
        storeId: storeId,
      },
    ];

    res.json({
      success: true,
      data: templates,
      total: templates.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as templatesRoutes };
