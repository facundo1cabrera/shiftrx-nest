import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateBidDto {
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    auctionId: number;

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}