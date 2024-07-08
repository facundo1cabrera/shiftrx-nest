import { Test, TestingModule } from '@nestjs/testing';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { AuctionService } from '../auction/auction.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { CreateBidDto } from './dto/bid.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

// Mock implementation for JwtService
const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
};

describe('BidController', () => {
    let app: INestApplication;
    let bidService: BidService;

    const mockBidService = {
        create: jest.fn(),
        getAllByAuctionId: jest.fn(),
        getAllByUserId: jest.fn(),
    };

    const mockPrismaService = {};
    const mockUserService = {
        findById: jest.fn(),
    };
    const mockAuctionService = {
        getAuctionById: jest.fn(),
        updateCurrentPrice: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BidController],
            providers: [
                { provide: BidService, useValue: mockBidService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: UserService, useValue: mockUserService },
                { provide: AuctionService, useValue: mockAuctionService },
                { provide: JwtService, useValue: mockJwtService },
                JwtGuard,
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    it('should return unauthorized if token is not provided', async () => {
        const createBidDto: CreateBidDto = {
            userId: 1,
            auctionId: 1,
            price: 100,
        };

        const newBid = {
            id: 1,
            userId: 1,
            bidderName: 'John Doe',
            price: 100,
            time: new Date(),
            auctionId: 1,
        };

        mockBidService.create.mockResolvedValue(newBid);
        mockUserService.findById.mockResolvedValue({ id: 1, name: 'John Doe' });
        mockAuctionService.updateCurrentPrice.mockResolvedValue({ id: 1, currentPrice: 100 });

        await request(app.getHttpServer())
            .post('/bid')
            .send(createBidDto)
            .expect(401);
    });

    it('should get bids by auction id', async () => {
        const auctionId = 1;
        const bids = [
            { id: 1, userId: 1, price: 100, auctionId },
            { id: 2, userId: 2, price: 200, auctionId },
        ];

        mockBidService.getAllByAuctionId.mockResolvedValue(bids);
        mockAuctionService.getAuctionById.mockResolvedValue({ id: auctionId });

        await request(app.getHttpServer())
            .get(`/bid/byAuction/${auctionId}`)
            .expect(200)
            .expect(bids);
    });

    it('should get bids by user id', async () => {
        const userId = 1;
        const bids = [
            { id: 1, userId, price: 100, auctionId: 1, title: 'Item 1' },
            { id: 2, userId, price: 200, auctionId: 2, title: 'Item 2' },
        ];

        mockBidService.getAllByUserId.mockResolvedValue(bids);
        mockUserService.findById.mockResolvedValue({ id: userId, name: 'John Doe' });

        await request(app.getHttpServer())
            .get(`/bid/byUser/${userId}`)
            .expect(200)
            .expect(bids);
    });

    afterEach(async () => {
        await app.close();
    });
});