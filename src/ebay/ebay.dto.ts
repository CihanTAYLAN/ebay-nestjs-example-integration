import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsInt,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  NEW_OTHER = 'NEW_OTHER',
  NEW_WITH_DEFECTS = 'NEW_WITH_DEFECTS',
  MANUFACTURER_REFURBISHED = 'MANUFACTURER_REFURBISHED',
  SELLER_REFURBISHED = 'SELLER_REFURBISHED',
  USED_EXCELLENT = 'USED_EXCELLENT',
  USED_VERY_GOOD = 'USED_VERY_GOOD',
  USED_GOOD = 'USED_GOOD',
  USED_ACCEPTABLE = 'USED_ACCEPTABLE',
  FOR_PARTS_OR_NOT_WORKING = 'FOR_PARTS_OR_NOT_WORKING',
}

export class ProductImageDto {
  @ApiProperty({ description: 'Image URL' })
  @IsUrl()
  imageUrl: string;
}

export class ProductSpecificationDto {
  @ApiProperty({ description: 'Specification name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Specification value' })
  @IsString()
  value: string;
}

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Unique SKU for the product' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Product title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product brand' })
  @IsString()
  brand: string;

  @ApiPropertyOptional({ description: 'Manufacturer Part Number (MPN)' })
  @IsOptional()
  @IsString()
  mpn?: string;

  @ApiProperty({ description: 'Product condition', enum: ProductCondition })
  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @ApiProperty({ description: 'Available quantity', example: 1 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Product images',
    type: [ProductImageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({
    description: 'Product specifications',
    type: [ProductSpecificationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications?: ProductSpecificationDto[];

  @ApiPropertyOptional({ description: 'Product weight in pounds', example: 0.5 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  weight?: number;

  @ApiPropertyOptional({ description: 'Product dimensions (LxWxH in inches)' })
  @IsOptional()
  @IsString()
  dimensions?: string;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Unique SKU for the product' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Product title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price in USD', example: 10 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Available quantity', example: 1 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Product brand' })
  @IsString()
  brand: string;

  @ApiPropertyOptional({ description: 'Manufacturer Part Number (MPN)' })
  @IsOptional()
  @IsString()
  mpn?: string;

  @ApiProperty({ description: 'Product condition', enum: ProductCondition })
  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @ApiPropertyOptional({
    description: 'eBay category ID (otomatik belirlenecek)',
    example: '3767',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Product images',
    type: [ProductImageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({
    description: 'Product specifications',
    type: [ProductSpecificationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications?: ProductSpecificationDto[];

  @ApiPropertyOptional({ description: 'Product weight in pounds', example: 0.5 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  weight?: number;

  @ApiPropertyOptional({ description: 'Product dimensions (LxWxH in inches)' })
  @IsOptional()
  @IsString()
  dimensions?: string;
}

export class UpdatePriceDto {
  @ApiProperty({ description: 'New price in USD', example: 10 })
  @IsNumber()
  @IsPositive()
  price: number;
}

export class PublishListingDto {
  @ApiPropertyOptional({
    description: 'Listing duration in days (1, 3, 5, 7, 10, 30)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  duration?: number;
}

// Response DTOs
export class InventoryItemResponse {
  @ApiProperty({ description: 'SKU of the created inventory item' })
  sku: string;

  @ApiProperty({ description: 'Status of the inventory item' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;
}

export class ProductOfferResponse {
  @ApiProperty({ description: 'Offer ID' })
  offerId: string;

  @ApiProperty({ description: 'SKU of the product' })
  sku: string;

  @ApiProperty({ description: 'Marketplace ID' })
  marketplaceId: string;

  @ApiProperty({ description: 'Offer status' })
  status: string;
}

export class ListingStatusResponse {
  @ApiProperty({ description: 'Listing ID' })
  listingId: string;

  @ApiProperty({ description: 'Offer ID' })
  offerId: string;

  @ApiProperty({ description: 'Listing status' })
  status: string;

  @ApiProperty({ description: 'eBay item ID' })
  ebayItemId?: string;

  @ApiProperty({ description: 'Listing URL' })
  listingUrl?: string;
}

export class OrderItemResponse {
  @ApiProperty({ description: 'SKU of the ordered item' })
  sku: string;

  @ApiProperty({ description: 'Item title' })
  title: string;

  @ApiProperty({ description: 'Quantity ordered', example: 1 })
  quantity: number;

  @ApiProperty({ description: 'Item price', example: 10 })
  price: number;

  @ApiProperty({ description: 'Total price for this item' })
  total: number;
}

export class OrderResponse {
  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ description: 'Order status' })
  orderStatus: string;

  @ApiProperty({ description: 'Order creation date' })
  creationDate: string;

  @ApiProperty({ description: 'Buyer username' })
  buyerUsername: string;

  @ApiProperty({ description: 'Total order amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Order currency' })
  currency: string;

  @ApiProperty({ description: 'Number of items in order' })
  itemCount: number;
}

export class OrderDetailResponse extends OrderResponse {
  @ApiProperty({ description: 'Order items', type: [OrderItemResponse] })
  items: OrderItemResponse[];

  @ApiProperty({ description: 'Shipping address' })
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateOrProvince: string;
    postalCode: string;
    countryCode: string;
  };

  @ApiProperty({ description: 'Payment information' })
  paymentSummary: {
    totalDueSeller: number;
    paymentStatus: string;
    paymentMethod: string;
  };
}
