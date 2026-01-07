import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getSettingsRepository } from '@/lib/db'
import { Settings } from '@/entities/Settings'

void Settings

export async function GET(request: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


