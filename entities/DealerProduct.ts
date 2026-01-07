import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm'

@Entity('dealer_products')
@Unique(['dealerId', 'productId'])
@Index(['dealerId'])
@Index(['productId'])
export class DealerProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  dealerId: string

  @ManyToOne('Dealer', 'dealerProducts', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dealerId' })
  dealer: any

  @Column({ type: 'uuid' })
  productId: string

  @ManyToOne('Product', 'dealerProducts', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: any

  @Column('float')
  price: number

  @Column('float', { default: 0 })
  discountRate: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

