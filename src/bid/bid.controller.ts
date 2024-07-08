import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BidService } from './bid.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateBidDto } from './dto/bid.dto';

@Controller('bid')
export class BidController {
    constructor(private bidService: BidService) {}


    @UseGuards(JwtGuard)
    @Post("")
    async createBid(@Body() dto: CreateBidDto) {
        return await this.bidService.create(dto);
    }

    @Get("byAuction/:id")
    async getBidsByAuctionId(@Param("id") id: number) {
        return await this.bidService.getAllByAuctionId(id);
    }

    @Get("byUser/:id")
    async getBidsByUserId(@Param("id") id: number) {
        return await this.bidService.getAllByUserId(id);
    }
}
