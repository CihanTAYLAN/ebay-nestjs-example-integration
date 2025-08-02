import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { EbayService } from './ebay.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateProductDto,
  CreateInventoryItemDto,
  UpdatePriceDto,
  PublishListingDto,
  InventoryItemResponse,
  ProductOfferResponse,
  ListingStatusResponse,
  OrderResponse,
  OrderDetailResponse,
} from './ebay.dto';

@ApiTags('eBay')
@ApiBearerAuth()
@Controller('ebay')
export class EbayController {
  constructor(private readonly ebayService: EbayService) {}

  @Post('inventory')
  @ApiOperation({ summary: 'Create inventory item' })
  @ApiResponse({
    status: 201,
    description: 'Inventory item created successfully',
    type: InventoryItemResponse,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createInventoryItem(
    @Body() inventoryData: CreateInventoryItemDto,
  ): Promise<InventoryItemResponse> {
    return this.ebayService.createInventoryItem(inventoryData);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new product offer' })
  @ApiResponse({
    status: 201,
    description: 'Product offer created successfully',
    type: ProductOfferResponse,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createProduct(
    @Body() product: CreateProductDto,
  ): Promise<ProductOfferResponse> {
    return this.ebayService.createProduct(product);
  }

  @Patch('products/:offerId/price')
  @ApiOperation({ summary: 'Update product price' })
  @ApiParam({ name: 'offerId', description: 'eBay offer ID' })
  @ApiResponse({ status: 200, description: 'Price updated successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProductPrice(
    @Param('offerId') offerId: string,
    @Body() priceData: UpdatePriceDto,
  ): Promise<void> {
    return this.ebayService.updateProductPrice(offerId, priceData);
  }

  @Post('products/:offerId/publish')
  @ApiOperation({ summary: 'Publish product listing' })
  @ApiParam({ name: 'offerId', description: 'eBay offer ID' })
  @ApiResponse({
    status: 200,
    description: 'Listing published successfully',
    type: ListingStatusResponse,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async publishListing(
    @Param('offerId') offerId: string,
    @Body() publishData?: PublishListingDto,
  ): Promise<ListingStatusResponse> {
    return this.ebayService.publishListing(offerId, publishData);
  }

  @Get('products/:offerId/status')
  @ApiOperation({ summary: 'Get listing status' })
  @ApiParam({ name: 'offerId', description: 'eBay offer ID' })
  @ApiResponse({
    status: 200,
    description: 'Listing status retrieved successfully',
    type: ListingStatusResponse,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getListingStatus(
    @Param('offerId') offerId: string,
  ): Promise<ListingStatusResponse> {
    return this.ebayService.getListingStatus(offerId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of orders to retrieve (default: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [OrderResponse],
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOrders(@Query('limit') limit?: number): Promise<OrderResponse[]> {
    return this.ebayService.getOrders(limit);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get order details' })
  @ApiParam({ name: 'orderId', description: 'eBay order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
    type: OrderDetailResponse,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOrderDetail(
    @Param('orderId') orderId: string,
  ): Promise<OrderDetailResponse> {
    return this.ebayService.getOrderDetail(orderId);
  }
}
