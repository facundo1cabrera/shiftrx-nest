import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UserService } from './user.service';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { hash } from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

describe('UserService', () => {
    let userService: UserService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        userService = module.get<UserService>(UserService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const dto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'Test name' };
            const hashedPassword = 'hashedPassword123';
            const newUser = { id: 1, email: dto.email, password: hashedPassword };

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prismaService.user.create as jest.Mock).mockResolvedValue(newUser);
            (hash as jest.Mock).mockResolvedValue(hashedPassword);

            const result = await userService.create(dto);

            expect(result).toEqual({ id: newUser.id, email: newUser.email });
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    ...dto,
                    password: hashedPassword,
                },
            });
        });

        it('should throw ConflictException if email already exists', async () => {
            const dto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'Test Name' };
            const existingUser = { id: 1, email: dto.email, password: 'password' };

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

            await expect(userService.create(dto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findByEmail', () => {
        it('should return a user by email', async () => {
            const email = 'test@example.com';
            const user = { id: 1, email };

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);

            const result = await userService.findByEmail(email);

            expect(result).toEqual(user);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
        });

        it('should return null if user is not found', async () => {
            const email = 'test@example.com';

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await userService.findByEmail(email);

            expect(result).toBeNull();
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
        });
    });

    describe('findById', () => {
        it('should return a user by ID', async () => {
            const id = 1;
            const user = { id, email: 'test@example.com' };

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);

            const result = await userService.findById(id);

            expect(result).toEqual(user);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id } });
        });

        it('should return null if user is not found', async () => {
            const id = 1;

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await userService.findById(id);

            expect(result).toBeNull();
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id } });
        });
    });
});