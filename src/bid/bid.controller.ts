import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BidService } from './bid.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateBidDto } from './dto/bid.dto';

@Controller('bid')
export class BidController {
    constructor(private bidService: BidService) {}


    @UseGuards(JwtGuard)
    @Post("")
    async createBid(@Body() dto: CreateBidDto) {
        return await this.bidService.create(dto);
    }

}
