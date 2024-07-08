import { Test, TestingModule } from '@nestjs/testing';
import { BidService } from './bid.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';
import { AuctionService } from '../auction/auction.service';
import { CreateBidDto } from './dto/bid.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BidService', () => {
  let service: BidService;
  let prismaService: PrismaService;
  let userService: UserService;
  let auctionService: AuctionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidService,
        { provide: PrismaService, useValue: { bid: { create: jest.fn(), findMany: jest.fn() } } },
        { provide: UserService, useValue: { findById: jest.fn() } },
        { provide: AuctionService, useValue: { updateCurrentPrice: jest.fn(), getAuctionById: jest.fn() } }
      ],
    }).compile();

    service = module.get<BidService>(BidService);
    prismaService = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
    auctionService = module.get<AuctionService>(AuctionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if user does not exist', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(null);

      const dto: CreateBidDto = { userId: 1, auctionId: 1, price: 100 };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create a new bid and update the auction price', async () => {
      const user = { id: 1, name: 'John Doe', password: '', email: '' };
      const newBid = { id: 1, userId: 1, bidderName: 'John Doe', price: 100, time: new Date(), auctionId: 1 };
      const updatedAuction = { 
        id: 1, 
        currentPrice: 100,
        image: '',
        title: '',
        description: '',
        startingPrice: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
        endTime: new Date(),
        userId: 1
    };

      jest.spyOn(userService, 'findById').mockResolvedValue(user);
      jest.spyOn(auctionService, 'updateCurrentPrice').mockResolvedValue(updatedAuction);
      jest.spyOn(prismaService.bid, 'create').mockResolvedValue(newBid);

      const dto: CreateBidDto = { userId: 1, auctionId: 1, price: 100 };
      const result = await service.create(dto);

      expect(result).toEqual(newBid);
      expect(auctionService.updateCurrentPrice).toHaveBeenCalledWith(dto.auctionId, dto.price);
      expect(prismaService.bid.create).toHaveBeenCalledWith({
        data: {
          userId: dto.userId,
          bidderName: user.name,
          price: dto.price,
          time: expect.any(Date),
          auctionId: dto.auctionId,
        },
      });
    });
  });

  describe('getAllByAuctionId', () => {
    it('should throw NotFoundException if auction does not exist', async () => {
      jest.spyOn(auctionService, 'getAuctionById').mockResolvedValue(null);

      await expect(service.getAllByAuctionId(1)).rejects.toThrow(NotFoundException);
    });

    it('should return all bids for the auction', async () => {
      const auction = { 
        id: 1, 
        currentPrice: 100,
        image: '',
        title: '',
        description: '',
        startingPrice: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
        endTime: new Date(),
        userId: 1
    };;
      const bids = [
        { id: 1, userId: 1, bidderName: 'John Doe', price: 100, time: new Date(), auctionId: 1 },
      ];

      jest.spyOn(auctionService, 'getAuctionById').mockResolvedValue(auction);
      jest.spyOn(prismaService.bid, 'findMany').mockResolvedValue(bids);

      const result = await service.getAllByAuctionId(1);

      expect(result).toEqual(bids);
      expect(prismaService.bid.findMany).toHaveBeenCalledWith({
        where: { auctionId: 1 },
      });
    });
  });

  describe('getAllByUserId', () => {
    it('should throw BadRequestException if user does not exist', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(null);

      await expect(service.getAllByUserId(1)).rejects.toThrow(BadRequestException);
    });

    it('should return all bids for the user', async () => {
      const user = { id: 1, name: 'John Doe', password: '', email: '' };
      const bids = [
        {
          id: 1,
          userId: 1,
          bidderName: 'John Doe',
          price: 100,
          time: new Date(),
          auctionId: 1,
          auction: { id: 1, title: 'Auction 1' },
        },
      ];

      jest.spyOn(userService, 'findById').mockResolvedValue(user);
      jest.spyOn(prismaService.bid, 'findMany').mockResolvedValue(bids);

      const result = await service.getAllByUserId(1);

      expect(result).toEqual(
        bids.map((x) => ({
          id: x.id,
          auctionId: x.auctionId,
          bidderName: x.bidderName,
          price: x.price,
          time: x.time,
          userId: x.userId,
          title: x.auction.title,
        }))
      );
      expect(prismaService.bid.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { auction: true },
      });
    });
  });
});