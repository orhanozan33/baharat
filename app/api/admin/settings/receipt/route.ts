import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getSettingsRepository } from '@/lib/db'
import { Settings } from '@/entities/Settings'

// Entity'yi zorla yükle - metadata için
void Settings

// GET - Receipt settings değerlerini al
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

    // Settings repository'yi al
    const settingsRepo = await getSettingsRepository()

    // Settings'leri al
    const allSettings = await settingsRepo.find()
    const settingsMap: { [key: string]: string } = {}

    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({
      settings: {
        receiptLogo: settingsMap['receiptLogo'] || '',
        companyName: settingsMap['companyName'] || '',
        companyAddress: settingsMap['companyAddress'] || '',
        companyPhone: settingsMap['companyPhone'] || '',
        companyEmail: settingsMap['companyEmail'] || '',
        companyTaxNumber: settingsMap['companyTaxNumber'] || '',
        tpsEnabled: settingsMap['tpsEnabled'] === 'true',
        tpsNumber: settingsMap['tpsNumber'] || '',
        tpsRate: settingsMap['tpsRate'] || '5',
        tvqEnabled: settingsMap['tvqEnabled'] === 'true',
        tvqNumber: settingsMap['tvqNumber'] || '',
        tvqRate: settingsMap['tvqRate'] || '9.975',
      },
    })
  } catch (error: any) {
    console.error('Get receipt settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Receipt settings güncelle
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
    const { receiptLogo, companyName, companyAddress, companyPhone, companyEmail, companyTaxNumber, tpsEnabled, tpsNumber, tpsRate, tvqEnabled, tvqNumber, tvqRate } = body

    // Settings repository'yi al
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

    // Upsert all receipt settings
    await upsertSetting('receiptLogo', receiptLogo || '')
    await upsertSetting('companyName', companyName || '')
    await upsertSetting('companyAddress', companyAddress || '')
    await upsertSetting('companyPhone', companyPhone || '')
    await upsertSetting('companyEmail', companyEmail || '')
    await upsertSetting('companyTaxNumber', companyTaxNumber || '')
    await upsertSetting('tpsEnabled', tpsEnabled ? 'true' : 'false')
    await upsertSetting('tpsNumber', tpsNumber || '')
    await upsertSetting('tpsRate', tpsRate ? tpsRate.toString() : '5')
    await upsertSetting('tvqEnabled', tvqEnabled ? 'true' : 'false')
    await upsertSetting('tvqNumber', tvqNumber || '')
    await upsertSetting('tvqRate', tvqRate ? tvqRate.toString() : '9.975')

    // Get all updated settings
    const allSettings = await settingsRepo.find()
    const settingsMap: { [key: string]: string } = {}
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({
      success: true,
      settings: {
        receiptLogo: settingsMap['receiptLogo'] || '',
        companyName: settingsMap['companyName'] || '',
        companyAddress: settingsMap['companyAddress'] || '',
        companyPhone: settingsMap['companyPhone'] || '',
        companyEmail: settingsMap['companyEmail'] || '',
        companyTaxNumber: settingsMap['companyTaxNumber'] || '',
        tpsEnabled: settingsMap['tpsEnabled'] === 'true',
        tpsNumber: settingsMap['tpsNumber'] || '',
        tpsRate: settingsMap['tpsRate'] || '5',
        tvqEnabled: settingsMap['tvqEnabled'] === 'true',
        tvqNumber: settingsMap['tvqNumber'] || '',
        tvqRate: settingsMap['tvqRate'] || '9.975',
      },
    })
  } catch (error: any) {
    console.error('Update receipt settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

