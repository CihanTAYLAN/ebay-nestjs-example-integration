import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import eBayApi = require('ebay-api');

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

@Injectable()
export class EbayService {
  private readonly logger = new Logger(EbayService.name);
  private eBay: eBayApi;
  private tokenExpirationTime: number = 0;

  constructor(private configService: ConfigService) {
    this.eBay = new eBayApi({
      appId: process.env.EBAY_APP_ID,
      certId: process.env.EBAY_CERT_ID,
      ruName: process.env.EBAY_RU_NAME,
      sandbox: process.env.EBAY_SANDBOX === 'true',
    });

    this.eBay.OAuth2.setScope([
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/sell.inventory',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    ]);
  }

  async authenticate(): Promise<void> {
    try {
      // Check if token is still valid
      if (this.tokenExpirationTime > Date.now()) {
        return;
      }

      this.logger.log('Authenticating with eBay API...');
      const token = await this.eBay.OAuth2.getToken(
        this.configService.get<string>('EBAY_AUTH_CODE'),
      );

      this.eBay.OAuth2.setCredentials(token);

      // Set token expiration time (usually 2 hours)
      this.tokenExpirationTime = Date.now() + token.expires_in * 1000 - 300000; // 5 minutes buffer

      this.logger.log('Successfully authenticated with eBay API');
    } catch (error) {
      this.logger.error('Failed to authenticate with eBay', error.stack);
      throw new InternalServerErrorException(
        'Failed to authenticate with eBay: ' + error.message,
      );
    }
  }

  async createInventoryItem(
    inventoryData: CreateInventoryItemDto,
  ): Promise<InventoryItemResponse> {
    await this.authenticate();
    try {
      this.logger.log(`Creating inventory item for SKU: ${inventoryData.sku}`);

      const inventoryItem = {
        availability: {
          shipToLocationAvailability: {
            quantity: inventoryData.quantity,
          },
        },
        condition: inventoryData.condition,
        product: {
          title: inventoryData.title,
          description: inventoryData.description,
          brand: inventoryData.brand,
          ...(inventoryData.images && {
            imageUrls: inventoryData.images.map((img) => img.imageUrl),
          }),
          ...(inventoryData.weight && {
            weight: {
              value: inventoryData.weight,
              unit: 'POUND',
            },
          }),
        },
      };

      await this.eBay.sell.inventory.createOrReplaceInventoryItem(
        inventoryData.sku,
        inventoryItem,
      );

      this.logger.log(
        `Successfully created inventory item for SKU: ${inventoryData.sku}`,
      );

      return {
        sku: inventoryData.sku,
        status: 'CREATED',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to create inventory item for SKU: ${inventoryData.sku}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to create inventory item: ' + error.message,
      );
    }
  }

  async createProduct(
    product: CreateProductDto,
  ): Promise<ProductOfferResponse> {
    await this.authenticate();
    try {
      this.logger.log(`Creating product offer for SKU: ${product.sku}`);

      // First create inventory item
      await this.createInventoryItem({
        sku: product.sku,
        title: product.title,
        description: product.description,
        brand: product.brand,
        condition: product.condition,
        quantity: product.quantity,
        images: product.images,
        specifications: product.specifications,
        weight: product.weight,
        dimensions: product.dimensions,
      });

      // Then create offer
      const offerData = {
        sku: product.sku,
        marketplaceId:
          this.configService.get<string>('EBAY_MARKETPLACE_ID') || 'EBAY_US',
        format: 'FIXED_PRICE',
        listingDescription: product.description,
        availableQuantity: product.quantity,
        categoryId: product.categoryId,
        pricingSummary: {
          price: {
            value: product.price.toString(),
            currency: this.configService.get<string>('EBAY_CURRENCY') || 'USD',
          },
        },
        merchantLocationKey: this.configService.get<string>(
          'EBAY_MERCHANT_LOCATION',
        ),
      };

      const offer = await this.eBay.sell.inventory.createOffer(offerData);

      this.logger.log(`Successfully created product offer: ${offer.offerId}`);

      return {
        offerId: offer.offerId,
        sku: product.sku,
        marketplaceId: offerData.marketplaceId,
        status: 'CREATED',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create product for SKU: ${product.sku}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to create product: ' + error.message,
      );
    }
  }

  async updateProductPrice(
    offerId: string,
    priceData: UpdatePriceDto,
  ): Promise<void> {
    await this.authenticate();
    try {
      this.logger.log(
        `Updating price for offer: ${offerId} to ${priceData.price}`,
      );

      await this.eBay.sell.inventory.updateOffer(offerId, {
        pricingSummary: {
          price: {
            value: priceData.price.toString(),
            currency: this.configService.get<string>('EBAY_CURRENCY') || 'USD',
          },
        },
      });

      this.logger.log(`Successfully updated price for offer: ${offerId}`);
    } catch (error) {
      this.logger.error(
        `Failed to update price for offer: ${offerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to update product price: ' + error.message,
      );
    }
  }

  async publishListing(
    offerId: string,
    publishData?: PublishListingDto,
  ): Promise<ListingStatusResponse> {
    await this.authenticate();
    try {
      this.logger.log(`Publishing listing for offer: ${offerId}`);

      const publishRequest: any = {};
      if (publishData?.duration) {
        publishRequest.listingDuration = `DAYS_${publishData.duration}`;
      }

      const response = await this.eBay.sell.inventory.publishOffer(offerId);

      this.logger.log(`Successfully published listing for offer: ${offerId}`);

      return {
        listingId: response.listingId,
        offerId: offerId,
        status: 'PUBLISHED',
        ebayItemId: response.ebayItemId,
        listingUrl: response.listingUrl,
      };
    } catch (error) {
      this.logger.error(
        `Failed to publish listing for offer: ${offerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to publish listing: ' + error.message,
      );
    }
  }

  async getListingStatus(offerId: string): Promise<ListingStatusResponse> {
    await this.authenticate();
    try {
      this.logger.log(`Getting listing status for offer: ${offerId}`);

      const offer = await this.eBay.sell.inventory.getOffer(offerId);

      return {
        listingId: offer.listingId || '',
        offerId: offerId,
        status: offer.status,
        ebayItemId: offer.ebayItemId,
        listingUrl: offer.listingUrl,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get listing status for offer: ${offerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to get listing status: ' + error.message,
      );
    }
  }
  async getOrders(limit: number = 50): Promise<OrderResponse[]> {
    await this.authenticate();
    try {
      this.logger.log(`Retrieving orders with limit: ${limit}`);

      const response = await this.eBay.sell.fulfillment.getOrders({
        limit: limit,
      });

      const orders = response.orders || [];

      return orders.map((order) => ({
        orderId: order.orderId,
        orderStatus: order.orderFulfillmentStatus,
        creationDate: order.creationDate,
        buyerUsername: order.buyer?.username || 'Unknown',
        totalAmount: parseFloat(order.pricingSummary?.total?.value || '0'),
        currency: order.pricingSummary?.total?.currency || 'USD',
        itemCount: order.lineItems?.length || 0,
      }));
    } catch (error) {
      this.logger.error('Failed to retrieve orders', error.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve orders: ' + error.message,
      );
    }
  }

  async getOrderDetail(orderId: string): Promise<OrderDetailResponse> {
    await this.authenticate();
    try {
      this.logger.log(`Retrieving order detail for: ${orderId}`);

      const order = await this.eBay.sell.fulfillment.getOrder(orderId);

      const orderItems =
        order.lineItems?.map((item) => ({
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          price: parseFloat(item.lineItemCost?.value || '0'),
          total: parseFloat(item.total?.value || '0'),
        })) || [];

      return {
        orderId: order.orderId,
        orderStatus: order.orderFulfillmentStatus,
        creationDate: order.creationDate,
        buyerUsername: order.buyer?.username || 'Unknown',
        totalAmount: parseFloat(order.pricingSummary?.total?.value || '0'),
        currency: order.pricingSummary?.total?.currency || 'USD',
        itemCount: orderItems.length,
        items: orderItems,
        shippingAddress: {
          name:
            order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
              ?.fullName || '',
          addressLine1:
            order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
              ?.contactAddress?.addressLine1 || '',
          addressLine2:
            order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
              ?.contactAddress?.addressLine2,
          city:
            order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
              ?.contactAddress?.city || '',
          stateOrProvince:
            order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
              ?.contactAddress?.stateOrProvince || '',
          postalCode:
            order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
              ?.contactAddress?.postalCode || '',
          countryCode:
            order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
              ?.contactAddress?.countryCode || '',
        },
        paymentSummary: {
          totalDueSeller: parseFloat(
            order.pricingSummary?.totalDueSeller?.value || '0',
          ),
          paymentStatus: order.paymentSummary?.paymentStatus || 'UNKNOWN',
          paymentMethod: order.paymentSummary?.paymentMethod || 'UNKNOWN',
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve order detail for: ${orderId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve order detail: ' + error.message,
      );
    }
  }
}
