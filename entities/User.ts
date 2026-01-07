import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm'
import { Order } from './Order'
import { UserRole } from './enums/UserRole'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true })
  @Index()
  supabaseId: string

  @Column({ type: 'varchar', unique: true })
  @Index()
  email: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  @Index()
  username?: string

  @Column({ type: 'varchar', nullable: true })
  password?: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  phone?: string

  @Column({ type: 'text', nullable: true })
  address?: string

  @Column({ type: 'varchar', nullable: true })
  city?: string

  @Column({ type: 'varchar', nullable: true })
  postalCode?: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne('Admin', 'user')
  admin?: any

  @OneToOne('Dealer', 'user')
  dealer?: any

  @OneToMany('Order', 'user')
  orders: any[]
}

