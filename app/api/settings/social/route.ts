import { NextRequest, NextResponse } from 'next/server'
import { getSettingsRepository } from '@/lib/db'
import { Settings } from '@/entities/Settings'

void Settings

// GET - Social media settings değerlerini al (public, auth gerekmez)
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


