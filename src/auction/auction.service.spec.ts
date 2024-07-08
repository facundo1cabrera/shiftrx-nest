import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { AuctionService } from './auction.service';
import { UserService } from '../user/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAuctionDto, UpdateAuctionDto } from './dto/auction.dto';

describe('AuctionService', () => {
    let auctionService: AuctionService;
    let prismaService: PrismaService;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuctionService,
                {
                    provide: PrismaService,
                    useValue: {
                        auction: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            findMany: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        auctionService = module.get<AuctionService>(AuctionService);
        prismaService = module.get<PrismaService>(PrismaService);
        userService = module.get<UserService>(UserService);
    });

    describe('createAuction', () => {
        it('should create a new auction', async () => {
            const dto: CreateAuctionDto = {
                userId: 1,
                startingPrice: 100,
                description: 'Test Description',
                endTime: new Date().toISOString(),
                image: 'test.jpg',
                title: 'Test Title',
            };
            const user = { id: 1, name: 'John Doe', password: '', email: '' };
            const newAuction = { 
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
            jest.spyOn(prismaService.auction, 'create').mockResolvedValue(newAuction);

            const result = await auctionService.createAuction(dto);

            expect(result).toEqual(newAuction);
            expect(userService.findById).toHaveBeenCalledWith(dto.userId);
            expect(prismaService.auction.create).toHaveBeenCalledWith({
                data: {
                    userId: dto.userId,
                    createdAt: expect.any(Date),
                    currentPrice: dto.startingPrice,
                    description: dto.description,
                    endTime: new Date(dto.endTime),
                    image: dto.image,
                    startingPrice: dto.startingPrice,
                    title: dto.title,
                    updatedAt: expect.any(Date),
                },
            });
        });

        it('should throw BadRequestException if user is not found', async () => {
            const dto: CreateAuctionDto = {
                userId: 1,
                startingPrice: 100,
                description: 'Test Description',
                endTime: new Date().toISOString(),
                image: 'test.jpg',
                title: 'Test Title',
            };

            jest.spyOn(userService, 'findById').mockResolvedValue(null);

            await expect(auctionService.createAuction(dto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getAuctionDetail', () => {
        it('should return auction details', async () => {
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
            };

            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(auction);

            const result = await auctionService.getAuctionDetail(1);

            expect(result).toEqual(auction);
            expect(prismaService.auction.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { bids: true },
            });
        });

        it('should throw NotFoundException if auction is not found', async () => {
            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(null);

            await expect(auctionService.getAuctionDetail(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAllAuctions', () => {
        it('should return all auctions', async () => {
            const auctions = [{ 
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
            }, { 
                id: 2, 
                currentPrice: 100,
                image: '',
                title: '',
                description: '',
                startingPrice: 20,
                createdAt: new Date(),
                updatedAt: new Date(),
                endTime: new Date(),
                userId: 1
            }];

            jest.spyOn(prismaService.auction, 'findMany').mockResolvedValue(auctions);

            const result = await auctionService.getAllAuctions();

            expect(result).toEqual(auctions);
            expect(prismaService.auction.findMany).toHaveBeenCalled();
        });
    });

    describe('updateAuction', () => {
        it('should update an auction', async () => {
            const dto: UpdateAuctionDto = {
                description: 'Updated Description',
                title: 'Updated Title',
                image: 'updated.jpg',
            };
            const auctionDb = { 
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
            const updatedAuction = { ...auctionDb, ...dto, updatedAt: new Date() };

            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(auctionDb);
            jest.spyOn(prismaService.auction, 'update').mockResolvedValue(updatedAuction);

            const result = await auctionService.updateAuction(1, dto);

            expect(result).toEqual(updatedAuction);
            expect(prismaService.auction.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prismaService.auction.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { ...auctionDb, ...dto, updatedAt: expect.any(Date) },
            });
        });

        it('should throw NotFoundException if auction is not found', async () => {
            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(null);

            await expect(auctionService.updateAuction(1, { title: 'New Title', description: 'New description', image: 'imageUrl' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteAuction', () => {
        it('should delete an auction', async () => {
            const auctionDb = { 
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

            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(auctionDb);
            jest.spyOn(prismaService.auction, 'delete').mockResolvedValue(auctionDb);

            await auctionService.deleteAuction(1);

            expect(prismaService.auction.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prismaService.auction.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should throw NotFoundException if auction is not found', async () => {
            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(null);

            await expect(auctionService.deleteAuction(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAuctionById', () => {
        it('should return auction by ID', async () => {
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

            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(auction);

            const result = await auctionService.getAuctionById(1);

            expect(result).toEqual(auction);
            expect(prismaService.auction.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should throw NotFoundException if auction is not found', async () => {
            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(null);

            await expect(auctionService.getAuctionById(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAuctionByUserId', () => {
        it('should return auctions by user ID', async () => {
            const auctions = [{ 
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
            }, { 
                id: 2, 
                currentPrice: 100,
                image: '',
                title: '',
                description: '',
                startingPrice: 20,
                createdAt: new Date(),
                updatedAt: new Date(),
                endTime: new Date(),
                userId: 1
            }];

            jest.spyOn(prismaService.auction, 'findMany').mockResolvedValue(auctions);

            const result = await auctionService.getAuctionByUserId(1);

            expect(result).toEqual(auctions);
            expect(prismaService.auction.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        });
    });

    describe('updateCurrentPrice', () => {
        it('should update the current price of an auction', async () => {
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
            const updatedAuction = { ...auction, currentPrice: 200 };

            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(auction);
            jest.spyOn(prismaService.auction, 'update').mockResolvedValue(updatedAuction);

            const result = await auctionService.updateCurrentPrice(1, 200);

            expect(result).toEqual(updatedAuction);
            expect(prismaService.auction.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prismaService.auction.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { ...auction, currentPrice: 200 },
            });
        });

        it('should throw NotFoundException if auction is not found', async () => {
            jest.spyOn(prismaService.auction, 'findUnique').mockResolvedValue(null);

            await expect(auctionService.updateCurrentPrice(1, 200)).rejects.toThrow(NotFoundException);
        });
    });
});
