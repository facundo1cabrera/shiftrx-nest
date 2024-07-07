import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAuctionDto, UpdateAuctionDto } from './dto/auction.dto';
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


    async getAuctionDetail(id: number) {
        const auction = await this.prisma.auction.findUnique({
            where: {
                id
            },
            include: {
                bids: true
            }
        })

        if (!auction) throw new NotFoundException();

        return auction;
    }

    async getAllAuctions() {
        const auctions = await this.prisma.auction.findMany();

        return auctions;
    }

    async updateAuction(id: number, dto: UpdateAuctionDto) {
        const auctionDb = await this.prisma.auction.findUnique({
            where: {
                id
            }
        });

        if (!auctionDb) throw new NotFoundException();

        auctionDb.description = dto.description;
        auctionDb.title = dto.title;
        auctionDb.image = dto.image;
        auctionDb.updatedAt = new Date(Date.now());

        const updatedAuction = await this.prisma.auction.update({
            where: {
                id
            },
            data: {
                ...auctionDb
            }
        })

        return updatedAuction;
    }

    async deleteAuction(id: number) {
        const auctionDb = await this.prisma.auction.findUnique({
            where: {
                id
            }
        });
        
        if (!auctionDb) throw new NotFoundException();

        await this.prisma.auction.delete({
            where: {
                id
            }
        });
    }

    async getAuctionById(id: number) {
        const auction = await this.prisma.auction.findUnique({
            where: {
                id
            }
        })

        if (!auction) throw new NotFoundException();

        return auction;
    }
}
