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
import { OrderStatus } from './enums/OrderStatus'

@Entity('orders')
@Index(['userId'])
@Index(['dealerId'])
@Index(['status'])
@Index(['orderNumber'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true })
  orderNumber: string

  @Column({ type: 'uuid', nullable: true })
  userId?: string

  @ManyToOne('User', 'orders', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: any

  @Column({ type: 'uuid', nullable: true })
  dealerId?: string

  @ManyToOne('Dealer', 'orders', {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'dealerId' })
  dealer?: any

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus

  @Column('float')
  subtotal: number

  @Column('float', { default: 0 })
  tax: number

  @Column('float', { default: 0 })
  shipping: number

  @Column('float', { default: 0 })
  discount: number

  @Column('float')
  total: number

  @Column({ type: 'varchar', default: 'CAD' })
  currency: string

  @Column({ type: 'varchar' })
  shippingName: string

  @Column({ type: 'varchar' })
  shippingPhone: string

  @Column({ type: 'varchar', nullable: true })
  shippingEmail?: string

  @Column({ type: 'text' })
  shippingAddress: string

  @Column({ type: 'varchar', nullable: true })
  shippingProvince?: string

  @Column({ type: 'varchar' })
  shippingCity: string

  @Column({ type: 'varchar', nullable: true })
  shippingPostalCode?: string

  @Column({ type: 'varchar', nullable: true })
  billingName?: string

  @Column({ type: 'text', nullable: true })
  billingAddress?: string

  @Column({ type: 'varchar', nullable: true })
  billingTaxNumber?: string

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({ type: 'varchar', nullable: true })
  trackingNumber?: string

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany('OrderItem', 'order')
  items: any[]

  @OneToMany('Invoice', 'order')
  invoices: any[]
}

