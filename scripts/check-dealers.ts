import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env dosyasını yükle
config({ path: resolve(process.cwd(), '.env') })

// Entity'leri import et - metadata yüklenmesi için
import '../entities/User'
import '../entities/Admin'
import '../entities/Dealer'
import '../entities/Category'
import '../entities/Product'
import '../entities/DealerProduct'
import '../entities/Order'
import '../entities/OrderItem'

import { getConnection } from '../lib/database'

async function checkDealers() {
  try {
    console.log('🔄 Veritabanı bağlantısı kuruluyor...')
    const connection = await getConnection()
    console.log('✅ Veritabanı bağlantısı başarılı!')

    // Tablo var mı kontrol et
    const tableCheck = await connection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dealers'
      )
    `)
    console.log('📊 Dealers tablosu var mı?', tableCheck[0]?.exists)

    // Dealer sayısı
    const countResult = await connection.query(`SELECT COUNT(*)::int as count FROM dealers`)
    const dealerCount = parseInt(countResult[0]?.count || '0', 10)
    console.log('📊 Toplam dealer sayısı:', dealerCount)

    if (dealerCount > 0) {
      // Tüm dealer'ları listele
      const allDealers = await connection.query(`
        SELECT 
          d.id, d."userId", d."companyName", d."taxNumber", d."discountRate", 
          d."isActive", d.address, d.phone, d.email, d."createdAt", d."updatedAt",
          u.id as "user_id", u.email as "user_email", u.name as "user_name", u.role as "user_role"
        FROM dealers d
        LEFT JOIN users u ON d."userId" = u.id
        ORDER BY d."createdAt" DESC
      `)
      
      console.log('\n📋 Tüm Dealer\'lar:')
      allDealers.forEach((dealer: any, index: number) => {
        console.log(`\n${index + 1}. Dealer:`)
        console.log(`   ID: ${dealer.id}`)
        console.log(`   Firma Adı: ${dealer.companyName}`)
        console.log(`   Aktif: ${dealer.isActive}`)
        console.log(`   Email: ${dealer.user_email || dealer.email || 'Yok'}`)
        console.log(`   User ID: ${dealer.userId}`)
        console.log(`   Oluşturulma: ${dealer.createdAt}`)
      })
    } else {
      console.log('\n⚠️ Veritabanında dealer kaydı bulunamadı!')
      console.log('💡 Yeni dealer eklemek için: /admin/dealers/new')
    }

    // Users tablosunda DEALER rolündeki kullanıcıları kontrol et
    const dealerUsers = await connection.query(`
      SELECT id, email, name, role, "createdAt"
      FROM users
      WHERE role = 'DEALER'
      ORDER BY "createdAt" DESC
    `)
    
    console.log(`\n👥 DEALER rolündeki kullanıcı sayısı: ${dealerUsers.length}`)
    if (dealerUsers.length > 0) {
      console.log('\n📋 DEALER Rolündeki Kullanıcılar:')
      for (let i = 0; i < dealerUsers.length; i++) {
        const user = dealerUsers[i]
        console.log(`\n${i + 1}. User:`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Ad: ${user.name || 'Yok'}`)
        console.log(`   Rol: ${user.role}`)
        
        // Bu user'ın dealer kaydı var mı kontrol et
        const dealerRecord = await connection.query(`
          SELECT id, "companyName", "isActive"
          FROM dealers
          WHERE "userId" = $1
        `, [user.id])
        
        if (dealerRecord && dealerRecord.length > 0) {
          console.log(`   ✅ Dealer kaydı var: ${dealerRecord[0].companyName}`)
        } else {
          console.log(`   ❌ Dealer kaydı YOK!`)
        }
      }
    }

    if (connection.isInitialized) {
      await connection.destroy()
    }
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Hata:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

checkDealers()

