import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { BidModule } from './bid/bid.module';
import { AuctionModule } from './auction/auction.module';
import { AppController } from './app.controller';

@Module({
  imports: [ConfigModule.forRoot(), UserModule, AuthModule, BidModule, AuctionModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
