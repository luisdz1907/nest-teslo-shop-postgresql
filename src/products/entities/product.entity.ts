import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany, ManyToMany } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { ProductImage } from './product-image.entity'
import { User } from 'src/auth/entities/user.entity'

@Entity({ name: 'products' })
export class Product {

   @ApiProperty()
   @PrimaryGeneratedColumn('uuid')
   id: string

   @ApiProperty()
   @Column('text', {
      unique: true
   })
   title: string

   @ApiProperty()
   @Column('float', {
      default: 0
   })
   price: number

   @ApiProperty()
   @Column({
      type: 'text',
      nullable: true
   })
   description: string

   @ApiProperty()
   @ApiProperty()
   @Column('text', {
      unique: true
   })

   slug: string
   @ApiProperty()
   @ApiProperty()
   @Column('int', {
      default: 0
   })
   stock: number
   @ApiProperty()

   @Column('text', {
      array: true
   })
   sizes: string[]
   @ApiProperty()

   @Column('text')
   gender: string
   @ApiProperty()

   @Column('text', {
      array: true,
      default: []
   })
   tags: string[]

   //TODO: Relacion de imagenes con prodcutos
   @OneToMany(
      () => ProductImage,
      (productImage) => productImage.product,
      { cascade: true, eager: true }
   )
   images?: ProductImage[]

   //TODO: Relacion de usuario con prodcutos
   @ManyToMany(
      () => User,
      (user) => user.product,
      { eager: true }
   )
   user: User

   @BeforeInsert()
   checkSlugInsert() {
      if (!this.slug) {
         this.slug = this.title
      }
      this.slug = this.slug.toLocaleLowerCase().replaceAll(' ', '_').replaceAll("'", '')
   }

   @BeforeUpdate()
   checkSlugUpdate() {
      this.slug = this.slug.toLocaleLowerCase().replaceAll(' ', '_').replaceAll("'", '')
   }


}
