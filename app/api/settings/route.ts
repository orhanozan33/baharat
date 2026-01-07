import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/database'
import { Settings } from '@/entities/Settings'
import { Repository } from 'typeorm'

// Entity'yi zorla yükle - metadata için
void Settings

// Public API - Vergi oranlarını almak için (auth gerektirmez)
export async function GET(request: NextRequest) {
  try {
    // Repository'yi doğrudan connection'dan al
    const connection = await getConnection()
    const settingsRepo = connection.getRepository(Settings) as Repository<Settings>

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

