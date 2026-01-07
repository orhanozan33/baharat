import 'reflect-metadata'
import 'dotenv/config'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../lib/database'

async function verifyOrderSchema() {
  try {
    console.log('Connecting to database...')
    const connection = await AppDataSource.initialize()
    
    const queryRunner = connection.createQueryRunner()
    
    console.log('\n=== Checking orders table schema ===\n')
    
    // Tüm sütunları kontrol et
    const columns = await queryRunner.query(`
      SELECT 
        column_name,
        is_nullable,
        data_type,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `)
    
    console.log('Orders table columns:')
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    // Özellikle userId sütununu kontrol et
    const userIdColumn = columns.find((c: any) => c.column_name === 'userId')
    if (userIdColumn) {
      console.log(`\n✅ userId column found: nullable=${userIdColumn.is_nullable}`)
      if (userIdColumn.is_nullable === 'NO') {
        console.log('⚠️ WARNING: userId is NOT NULL - need to fix!')
        console.log('Running ALTER TABLE...')
        await queryRunner.query(`ALTER TABLE orders ALTER COLUMN "userId" DROP NOT NULL`)
        console.log('✅ Fixed! userId is now nullable')
      } else {
        console.log('✅ userId is already nullable')
      }
    } else {
      console.log('❌ userId column not found!')
    }
    
    // Constraint'leri de kontrol et
    const constraints = await queryRunner.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type
      FROM pg_constraint
      WHERE conrelid = 'orders'::regclass
    `)
    
    console.log('\nTable constraints:')
    constraints.forEach((c: any) => {
      console.log(`  - ${c.constraint_name} (${c.constraint_type})`)
    })
    
    await queryRunner.release()
    await connection.destroy()
    
    console.log('\n✅ Schema verification completed!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

verifyOrderSchema()

