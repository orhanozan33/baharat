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

export enum CheckStatus {
  PENDING = 'PENDING',
  DEPOSITED = 'DEPOSITED',
  CLEARED = 'CLEARED',
  BOUNCED = 'BOUNCED',
  CANCELLED = 'CANCELLED',
}

@Entity('checks')
@Index(['dealerId'])
export class Check {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  dealerId: string

  @ManyToOne('Dealer', 'checks', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dealerId' })
  dealer: any

  @Column('float')
  amount: number

  @Column({ type: 'varchar' })
  checkNumber: string

  @Column({ type: 'varchar' })
  bankName: string

  @Column({ type: 'date' })
  issueDate: Date

  @Column({ type: 'date' })
  dueDate: Date

  @Column({
    type: 'enum',
    enum: CheckStatus,
    default: CheckStatus.PENDING,
  })
  status: CheckStatus

  @Column({ type: 'text', nullable: true })
  notes?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

