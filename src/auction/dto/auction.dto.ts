import { IsDateString, IsNumber, IsString } from "class-validator";


export class CreateAuctionDto {
    @IsNumber()
    userId: number;

    @IsString()
    image: string;

    @IsString()
    title: string;
    
    @IsString()
    description: string

    @IsNumber()
    startingPrice: number

    @IsDateString()
    endTime: string
}