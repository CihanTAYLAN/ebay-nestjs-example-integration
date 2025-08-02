import { Controller, Post, Body, Patch, Get, Param } from '@nestjs/common';
import { EbayService } from './ebay.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateProductDto } from './ebay.dto';

@ApiTags('eBay')
@ApiBearerAuth()
@Controller('ebay')
export class EbayController {
  constructor(private readonly ebayService: EbayService) {}

  @Post('products')
  @ApiOperation({ summary: 'Create a new product listing' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createProduct(@Body() product: CreateProductDto) {
    return this.ebayService.createProduct(product);
  }

  @Patch('products/:offerId/price')
  @ApiOperation({ summary: 'Update product price' })
  @ApiResponse({ status: 200, description: 'Price updated successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProductPrice(
    @Param('offerId') offerId: string,
    @Body('price') price: number,
  ) {
    return this.ebayService.updateProductPrice(offerId, price);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOrders() {
    return this.ebayService.getOrders();
  }
}
