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

// GET - Social media settings değerlerini al (public, auth gerekmez)
export async function GET(request: NextRequest) {
  try {
    // Database bağlantısını kur
    await connectDB()
    
    const settingsRepo = await getSettingsRepository()
    const allSettings = await settingsRepo.find()
    const settingsMap: { [key: string]: string } = {}

    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({
      settings: {
        facebook: settingsMap['socialFacebook'] || '',
        instagram: settingsMap['socialInstagram'] || '',
        twitter: settingsMap['socialTwitter'] || '',
        tiktok: settingsMap['socialTiktok'] || '',
      },
    })
  } catch (error: any) {
    console.error('Get social settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}



