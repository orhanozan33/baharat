import 'reflect-metadata'
import 'dotenv/config'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../lib/database'

async function fixOrderUserIdNullable() {
  try {
    console.log('Connecting to database...')
    const connection = await AppDataSource.initialize()
    
    console.log('Checking current userId column constraint...')
    const queryRunner = connection.createQueryRunner()
    
    // Mevcut sütun bilgisini kontrol et
    const columnInfo = await queryRunner.query(`
      SELECT 
        column_name,
        is_nullable,
        data_type
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'userId'
    `)
    
    console.log('Current column info:', columnInfo)
    
    if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'NO') {
      console.log('Making userId column nullable...')
      await queryRunner.query(`
        ALTER TABLE orders 
        ALTER COLUMN "userId" DROP NOT NULL
      `)
      console.log('✅ Successfully made userId column nullable!')
    } else if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'YES') {
      console.log('✅ userId column is already nullable!')
    } else {
      console.log('⚠️ userId column not found in orders table')
    }
    
    // Ayrıca shippingProvince sütununu da kontrol et
    const provinceColumnInfo = await queryRunner.query(`
      SELECT 
        column_name,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'shippingProvince'
    `)
    
    if (provinceColumnInfo.length === 0) {
      console.log('Adding shippingProvince column...')
      await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN "shippingProvince" VARCHAR
      `)
      console.log('✅ Successfully added shippingProvince column!')
    } else {
      console.log('✅ shippingProvince column already exists')
    }
    
    await queryRunner.release()
    await connection.destroy()
    
    console.log('✅ Database update completed!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

fixOrderUserIdNullable()

