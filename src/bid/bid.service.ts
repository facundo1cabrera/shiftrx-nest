import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateBidDto } from './dto/bid.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BidService {
    constructor(private prisma: PrismaService, private userService: UserService) {

    }

    async create(dto: CreateBidDto) {
        const user = await this.userService.findById(dto.userId);
        
        if (!user) throw new BadRequestException();

        const newBid = await this.prisma.bid.create({
            data: {
                userId: dto.userId,
                bidderName: user.name,
                price: dto.price,
                time: new Date(Date.now()),
                auctionId: dto.auctionId
            }
        });

        return newBid;
    }
}
