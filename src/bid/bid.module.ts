import { Module } from '@nestjs/common';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuctionService } from 'src/auction/auction.service';
import { BidGateway } from './bid.gateway';

@Module({
  controllers: [BidController],
  providers: [BidService, PrismaService, JwtService, UserService, AuctionService, BidGateway]
})
export class BidModule {}
