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

@Entity('categories')
@Index(['slug'])
@Index(['parentId'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar', unique: true })
  slug: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'varchar', nullable: true })
  image?: string

  @Column({ type: 'uuid', nullable: true })
  parentId?: string

  @ManyToOne('Category', 'children', {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: any

  @OneToMany('Category', 'parent', { cascade: false })
  children: any[]

  @Column({ type: 'int', default: 0 })
  order: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany('Product', 'category')
  products: any[]
}

