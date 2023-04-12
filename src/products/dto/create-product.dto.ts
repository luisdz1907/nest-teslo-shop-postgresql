import { IsString, IsInt, IsOptional, IsNumber, IsPositive, MinLength, IsArray, IsIn } from 'class-validator'


export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title: string

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number

    @IsString()
    @IsOptional()
    @MinLength(1)
    description?: string

    @IsString()
    @IsOptional()
    @MinLength(1)
    slug?: string


    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number

    @IsString({ each: true })
    @IsArray()
    sizes: string[]

    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender?: string

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags: string[]

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images: string[]
}
