import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateBidDto } from './dto/bid.dto';
import { UserService } from 'src/user/user.service';
import { AuctionService } from 'src/auction/auction.service';

@Injectable()
export class BidService {
    constructor(private prisma: PrismaService, private userService: UserService, private auctionService: AuctionService) {

    }

    async create(dto: CreateBidDto) {
        const user = await this.userService.findById(dto.userId);

        if (!user) throw new BadRequestException();

        // The current price is updated on every write, because the tradeoff would be to make a join query on each getAuction endpoint call
        // And the system is going to have a lot more reads than writes
        const updatedAuctionPromise = this.auctionService.updateCurrentPrice(dto.auctionId, dto.price);

        const newBidPromise = this.prisma.bid.create({
            data: {
                userId: dto.userId,
                bidderName: user.name,
                price: dto.price,
                time: new Date(Date.now()),
                auctionId: dto.auctionId
            }
        });

        const [newBid, updatedAuction] = await Promise.all([newBidPromise, updatedAuctionPromise]);

        return newBid;
    }

    async getAllByAuctionId(id: number) {
        const auction = await this.auctionService.getAuctionById(id);

        if (!auction) throw new NotFoundException();

        const bids = await this.prisma.bid.findMany({
            where: {
                auctionId: id
            }
        });

        return bids;
    }

    async getAllByUserId(id) {
        const user = await this.userService.findById(id);

        if (!user) throw new BadRequestException();
    
        const bids = await this.prisma.bid.findMany({
            where: {
                userId: id
            },
            include: {
                auction: true
            }
        });

        return bids.map(x => ({
            id: x.id,
            auctionId: x.auctionId,
            bidderName: x.bidderName,
            price: x.price,
            time: x.time,
            userId: x.userId,
            title: x.auction.title
        }));
    }
}
