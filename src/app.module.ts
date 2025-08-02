import { Module } from '@nestjs/common';
import { EbayService } from './ebay/ebay.service';
import { EbayController } from './ebay/ebay.controller';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [EbayController, AuthController],
  providers: [EbayService, AuthService],
})
export class AppModule {}
