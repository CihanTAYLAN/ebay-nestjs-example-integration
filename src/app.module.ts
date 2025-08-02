import { Module } from '@nestjs/common';
import { EbayService } from './ebay/ebay.service';
import { EbayController } from './ebay/ebay.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [EbayController],
  providers: [EbayService],
})
export class AppModule {}
