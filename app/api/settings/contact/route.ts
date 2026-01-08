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
        contactLocation: settingsMap['contactLocation'] || '',
        contactPhone: settingsMap['contactPhone'] || '',
        contactEmail: settingsMap['contactEmail'] || '',
        contactHours: settingsMap['contactHours'] || '',
      },
    })
  } catch (error: any) {
    console.error('Get contact settings error:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}



