import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', unique: true })
  userId: string

  @OneToOne('User', 'admin', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: any

  @Column({ type: 'varchar' })
  fullName: string

  @Column('simple-array', { default: '' })
  permissions: string[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

