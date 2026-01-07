import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm'

@Entity('products')
@Index(['slug'])
@Index(['categoryId'])
@Index(['isActive', 'isFeatured'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar', nullable: true })
  baseName?: string // Gruplama için - aynı isimdeki ürünler için ortak isim

  @Column({ type: 'varchar', unique: true })
  slug: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'text', nullable: true })
  shortDescription?: string

  @Column({ type: 'varchar', unique: true })
  sku: string

  @Column('float')
  price: number

  @Column('float', { nullable: true })
  comparePrice?: number

  @Column('float', { nullable: true })
  costPrice?: number

  @Column({ type: 'int', default: 0 })
  stock: number

  @Column({ type: 'boolean', default: true })
  trackStock: boolean

  @Column({ type: 'varchar', default: 'g', nullable: true })
  unit?: string // 'g' (gram) veya 'ml' (mililitre)

  @Column('float', { nullable: true })
  weight?: number

  @Column('simple-array', { default: '' })
  images: string[]

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean

  @Column({ type: 'uuid', nullable: true })
  categoryId?: string

  @ManyToOne('Category', 'products', {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category?: any

  @Column({ type: 'varchar', nullable: true })
  metaTitle?: string

  @Column({ type: 'text', nullable: true })
  metaDescription?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany('OrderItem', 'product')
  orderItems: any[]

  @OneToMany('DealerProduct', 'product')
  dealerProducts: any[]
}

