import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateAuctionDto } from './dto/auction.dto';

@Controller('auction')
export class AuctionController {
    constructor(private auctionService: AuctionService) {}

    @UseGuards(JwtGuard)
    @Post("")
    async createAuction(@Body() dto: CreateAuctionDto) {
        return await this.auctionService.createAuction(dto);
    }
}