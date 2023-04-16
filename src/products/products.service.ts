import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid'
import { ProductImage, Product } from './entities';
import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) { }

  async create(createProductDto: CreateProductDto, user:User) {

    const { images = [], ...productDetails } = createProductDto

    try {
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user
      })
      console.log(product)
      const productSave = await this.productRepository.save(product)

      return { ...productSave, images }
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 5, offset = 0 } = paginationDto
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });
    return products.map(item => ({
      ...item,
      images: item.images.map(img => img.url)
    }))
  }

  async findOne(term: string) {
    let product: Product

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }

    if (!product)
      throw new NotFoundException(`Producto con el term ${term} no encontrado`)

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term)
    return {
      ...rest,
      images: images.map(item => item.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user:User) {

    const { images, ...toUpdate } = updateProductDto

    const product = await this.productRepository.preload({ id: id, ...toUpdate })

    if (!product) {
      throw new NotFoundException(`Producto con el id ${id} no encontrado`)
    }

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()


    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } })
        product.images = images.map(img => this.productImageRepository.create({ url: img }))
      }

      product.user = user
      await queryRunner.manager.save(product)
      await queryRunner.commitTransaction()
      await queryRunner.release()

      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      this.handleExceptions(error)
    }

  }

  async remove(id: string) {
    const product = await this.productRepository.findOneBy({ id })

    if (!product) {
      throw new NotFoundException(`Producto con el id ${id} no encontrado`)
    }

    await this.productRepository.remove(product)

    return {
      message: 'Producto eliminado'
    };
  }

  private handleExceptions(error: any) {
    if (error.code === "23505") {
      throw new BadRequestException(error.detail)
    }

    this.logger.error(error)
    throw new InternalServerErrorException('Help, check server logs!')
  }


  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product')
    try {
      return await query.delete().where({}).execute()
    } catch (error) {
      this.handleExceptions(error)
    }
  }

}
