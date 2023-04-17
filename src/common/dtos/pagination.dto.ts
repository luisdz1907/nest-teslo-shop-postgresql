import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator"


export class PaginationDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Type(() => Number)
    limit?: number

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    offset?: number
}