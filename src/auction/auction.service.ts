import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAuctionDto } from './dto/auction.dto';
import { UserService } from 'src/user/user.service';
import { Auction } from '@prisma/client';

@Injectable()
export class AuctionService {
    constructor(private prisma: PrismaService, private userService: UserService) {}

    async createAuction(dto: CreateAuctionDto) {
        const user = await this.userService.findById(dto.userId);
        
        if (!user) throw new BadRequestException();

        const newAuction = await this.prisma.auction.create({
            data: {
                userId: dto.userId,
                createdAt: new Date(Date.now()),
                currentPrice: dto.startingPrice,
                description: dto.description,
                endTime: new Date(dto.endTime),
                image: dto.image,
                startingPrice: dto.startingPrice,
                title: dto.title,
                updatedAt: new Date(Date.now()),
            }
        });

        return newAuction;
    }
}
