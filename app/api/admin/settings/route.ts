import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getSettingsRepository } from '@/lib/db'
import { Settings } from '@/entities/Settings'
import { Repository } from 'typeorm'

// Entity'yi zorla yükle - metadata için
void Settings

// GET - Settings değerlerini al
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
    const receiptLogo = settingsMap['receiptLogo'] || ''

    return NextResponse.json({
      settings: {
        federalTaxRate,
        provincialTaxRate,
        receiptLogo,
      },
    })
  } catch (error: any) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Settings güncelle
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
    const { federalTaxRate, provincialTaxRate } = body

    if (federalTaxRate === undefined || provincialTaxRate === undefined) {
      return NextResponse.json(
        { error: 'federalTaxRate and provincialTaxRate are required' },
        { status: 400 }
      )
    }

    // Settings repository'yi al
    const settingsRepo = await getSettingsRepository()

    // Federal tax rate - upsert logic
    let federalSetting = await settingsRepo.findOne({ where: { key: 'federalTaxRate' } })
    if (federalSetting) {
      federalSetting.value = String(federalTaxRate)
      await settingsRepo.save(federalSetting)
    } else {
      federalSetting = settingsRepo.create({ 
        key: 'federalTaxRate', 
        value: String(federalTaxRate) 
      })
      await settingsRepo.save(federalSetting)
    }

    // Provincial tax rate - upsert logic
    let provincialSetting = await settingsRepo.findOne({ where: { key: 'provincialTaxRate' } })
    if (provincialSetting) {
      provincialSetting.value = String(provincialTaxRate)
      await settingsRepo.save(provincialSetting)
    } else {
      provincialSetting = settingsRepo.create({ 
        key: 'provincialTaxRate', 
        value: String(provincialTaxRate) 
      })
      await settingsRepo.save(provincialSetting)
    }

    return NextResponse.json({
      success: true,
      settings: {
        federalTaxRate: federalSetting.value,
        provincialTaxRate: provincialSetting.value,
      },
    })
  } catch (error: any) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

