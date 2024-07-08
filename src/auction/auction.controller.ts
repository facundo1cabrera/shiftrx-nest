import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateAuctionDto, UpdateAuctionDto } from './dto/auction.dto';

@Controller('auction')
export class AuctionController {
    constructor(private auctionService: AuctionService) {}

    @UseGuards(JwtGuard)
    @Post("")
    async createAuction(@Body() dto: CreateAuctionDto) {
        console.log("received request")
        return await this.auctionService.createAuction(dto);
    }

    @Get(":id")
    async getAuction(@Param("id") id: number) {
        return await this.auctionService.getAuctionDetail(id);
    }

    @Get("")
    async getAllAuctions() {
        console.log("getAllAuctions endpoint")
        return await this.auctionService.getAllAuctions();
    }

    @Put(":id")
    @UseGuards(JwtGuard)
    async updateAuction(@Param("id") id: number, @Body() dto: UpdateAuctionDto) {
        return await this.auctionService.updateAuction(id, dto);
    }

    @Delete(":id")
    @UseGuards(JwtGuard)
    async deleteAuction(@Param("id") id: number) {
        return await this.auctionService.deleteAuction(id);
    }

    @Get("byUser/:id")
    @UseGuards(JwtGuard)
    async getAuctionsByUserId(@Param("id") id: number) {
        return await this.auctionService.getAuctionByUserId(id);
    }

}
