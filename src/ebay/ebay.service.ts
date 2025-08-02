import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import eBayApi from 'ebay-api';

import { CreateProductDto } from './ebay.dto';

@Injectable()
export class EbayService {
  private eBay: eBayApi;

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
      const token = await this.eBay.OAuth2.getToken(
        this.configService.get<string>('EBAY_AUTH_CODE'),
      );
      this.eBay.OAuth2.setCredentials(token);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to authenticate with eBay',
      );
    }
  }

  async createProduct(product: CreateProductDto): Promise<{ offerId: string }> {
    await this.authenticate();
    try {
      const offer = await this.eBay.sell.inventory.createOffer({
        sku: product.sku,
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        listingDescription: product.description,
        availableQuantity: product.quantity,
        pricingSummary: {
          price: {
            value: product.price.toString(),
            currency: 'USD',
          },
        },
        merchantLocationKey: this.configService.get<string>(
          'EBAY_MERCHANT_LOCATION',
        ),
      });
      return { offerId: offer.offerId };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create product: ' + error.message,
      );
    }
  }

  async updateProductPrice(offerId: string, price: number): Promise<void> {
    await this.authenticate();
    try {
      await this.eBay.sell.inventory.updateOffer(offerId, {
        pricingSummary: {
          price: {
            value: price.toString(),
            currency: 'USD',
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update product price: ' + error.message,
      );
    }
  }
  async getOrders(): Promise<any[]> {
    await this.authenticate();
    try {
      const response = await this.eBay.sell.fulfillment.getOrders({
        limit: 50,
      });
      return response.orders || [];
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve orders: ' + error.message,
      );
    }
  }
}
