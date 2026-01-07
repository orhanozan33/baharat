import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'

@Entity('order_items')
@Index(['orderId'])
@Index(['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  orderId: string

  @ManyToOne('Order', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: any

  @Column({ type: 'uuid' })
  productId: string

  @ManyToOne('Product', undefined, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product: any

  @Column('float')
  quantity: number

  @Column('float')
  price: number

  @Column('float', { default: 0 })
  discount: number

  @Column('float')
  total: number

  @Column({ type: 'varchar', nullable: true })
  sku?: string

  @CreateDateColumn()
  createdAt: Date
}

