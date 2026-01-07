import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm'
import { Order } from './Order'
import { DealerProduct } from './DealerProduct'

@Entity('dealers')
export class Dealer {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', unique: true })
  userId: string

  @OneToOne('User', 'dealer', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: any

  @Column({ type: 'varchar' })
  companyName: string

  @Column({ type: 'varchar', nullable: true, unique: true })
  @Index()
  taxNumber?: string

  @Column('float', { default: 0 })
  discountRate: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'text', nullable: true })
  address?: string

  @Column({ type: 'varchar', nullable: true })
  phone?: string

  @Column({ type: 'varchar', nullable: true })
  email?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany('Order', 'dealer')
  orders: any[]

  @OneToMany('DealerProduct', 'dealer')
  dealerProducts: any[]

  @OneToMany('Payment', 'dealer')
  payments: any[]

  @OneToMany('Check', 'dealer')
  checks: any[]
}

