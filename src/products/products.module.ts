import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage,Product } from './entities';

@Module({
  imports:[
    TypeOrmModule.forFeature([ Product, ProductImage ]),
  ],
  exports:[
    ProductsService
  ],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
