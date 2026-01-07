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

export enum PaymentType {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
}

@Entity('payments')
@Index(['dealerId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  dealerId: string

  @ManyToOne('Dealer', 'payments', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dealerId' })
  dealer: any

  @Column('float')
  amount: number

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.CASH,
  })
  type: PaymentType

  @Column({ type: 'date' })
  paymentDate: Date

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'varchar', nullable: true })
  referenceNumber?: string

  @Column({ type: 'varchar', nullable: true })
  checkId?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

