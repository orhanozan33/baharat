import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getSettingsRepository } from '@/lib/db'
import { Settings } from '@/entities/Settings'

void Settings

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
    const { contactLocation, contactPhone, contactEmail, contactHours } = body

    const settingsRepo = await getSettingsRepository()

    const upsertSetting = async (key: string, value: string) => {
      let setting = await settingsRepo.findOne({ where: { key } })
      if (setting) {
        setting.value = value || ''
        await settingsRepo.save(setting)
      } else {
        setting = settingsRepo.create({ key, value: value || '' })
        await settingsRepo.save(setting)
      }
      return setting.value
    }

    const updatedSettings = {
      contactLocation: await upsertSetting('contactLocation', contactLocation),
      contactPhone: await upsertSetting('contactPhone', contactPhone),
      contactEmail: await upsertSetting('contactEmail', contactEmail),
      contactHours: await upsertSetting('contactHours', contactHours),
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    })
  } catch (error: any) {
    console.error('Update contact settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}



