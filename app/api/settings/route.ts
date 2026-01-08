// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri direkt import et - metadata yüklenmesi için KRİTİK
import { Settings } from '@/src/database/entities/Settings'
void Settings

// Repositories ve typeorm'u import et
import '@/src/database/repositories'
import '@/src/database/typeorm'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB, getSettingsRepository } from '@/lib/db'

// Public API - Vergi oranlarını almak için (auth gerektirmez)
export async function GET(request: NextRequest) {
  try {
    // Database bağlantısını kur
    await connectDB()
    
    const settingsRepo = await getSettingsRepository()

    // Varsayılan vergi oranları
    const defaultFederalTaxRate = '5' // %5 GST
    const defaultProvincialTaxRate = '8' // %8 PST (Ontario için örnek)

    // Settings'leri al
    const allSettings = await settingsRepo.find()
    const settingsMap: { [key: string]: string } = {}

    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value
    }

    // Eğer yoksa varsayılanları döndür
    const federalTaxRate = settingsMap['federalTaxRate'] || defaultFederalTaxRate
    const provincialTaxRate = settingsMap['provincialTaxRate'] || defaultProvincialTaxRate

    return NextResponse.json({
      settings: {
        federalTaxRate,
        provincialTaxRate,
      },
    })
  } catch (error: any) {
    console.error('Get settings error:', error)
    // Hata durumunda varsayılan değerleri döndür
    return NextResponse.json({
      settings: {
        federalTaxRate: '5',
        provincialTaxRate: '8',
      },
    })
  }
}

