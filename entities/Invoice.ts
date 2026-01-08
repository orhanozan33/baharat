import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'

@Entity('invoices')
@Index(['invoiceNumber'])
@Index(['orderId'])
@Index(['createdAt'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true })
  invoiceNumber: string

  @Column({ type: 'uuid' })
  orderId: string

  @ManyToOne('Order', 'invoices', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order?: any

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

  // Müşteri bilgileri (snapshot)
  @Column({ type: 'varchar' })
  customerName: string

  @Column({ type: 'varchar', nullable: true })
  customerPhone?: string

  @Column({ type: 'text', nullable: true })
  customerAddress?: string

  @Column({ type: 'varchar', nullable: true })
  customerCity?: string

  @Column({ type: 'varchar', nullable: true })
  customerPostalCode?: string

  @Column({ type: 'varchar', nullable: true })
  billingName?: string

  @Column({ type: 'text', nullable: true })
  billingAddress?: string

  @Column({ type: 'varchar', nullable: true })
  billingTaxNumber?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}


