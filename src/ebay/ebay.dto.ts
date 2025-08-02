import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsInt } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Unique SKU for the product' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price in USD' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Available quantity' })
  @IsInt()
  @IsPositive()
  quantity: number;
}
