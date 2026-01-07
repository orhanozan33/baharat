import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getSettingsRepository } from '@/lib/db'
import { Settings } from '@/entities/Settings'

void Settings

// GET - Social media settings değerlerini al
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

// PUT - Social media settings güncelle
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { facebook, instagram } = body

    const settingsRepo = await getSettingsRepository()

    // Helper function to upsert setting
    const upsertSetting = async (key: string, value: string) => {
      let setting = await settingsRepo.findOne({ where: { key } })
      if (setting) {
        setting.value = value || ''
        await settingsRepo.save(setting)
      } else {
        setting = settingsRepo.create({ key, value: value || '' })
        await settingsRepo.save(setting)
      }
      return setting
    }

    // Upsert all social media settings
    await upsertSetting('socialFacebook', facebook || '')
    await upsertSetting('socialInstagram', instagram || '')

    // Get all updated settings
    const allSettings = await settingsRepo.find()
    const settingsMap: { [key: string]: string } = {}
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({
      success: true,
      settings: {
        facebook: settingsMap['socialFacebook'] || '',
        instagram: settingsMap['socialInstagram'] || '',
      },
    })
  } catch (error: any) {
    console.error('Update social settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


