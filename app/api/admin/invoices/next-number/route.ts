import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getSettingsRepository } from '@/lib/db'
import { Settings } from '@/entities/Settings'

// Entity'yi zorla yükle - metadata için
void Settings

// GET - Sonraki fatura numarasını al ve sayacı artır
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

    // Invoice counter'ı bul veya oluştur
    let counterSetting = await settingsRepo.findOne({ where: { key: 'invoiceNumberCounter' } })
    
    if (!counterSetting) {
      // İlk kez oluşturuluyor, 0'dan başla
      counterSetting = settingsRepo.create({ key: 'invoiceNumberCounter', value: '0' })
      await settingsRepo.save(counterSetting)
    }

    // Sayacı artır
    const currentCounter = parseInt(counterSetting.value || '0', 10)
    const nextCounter = currentCounter + 1
    
    // Yeni değeri kaydet
    counterSetting.value = nextCounter.toString()
    await settingsRepo.save(counterSetting)

    // Fatura numarasını formatla (5 haneli, başında sıfırlarla)
    const invoiceNumber = String(nextCounter).padStart(5, '0')

    return NextResponse.json({
      invoiceNumber,
      counter: nextCounter,
    })
  } catch (error: any) {
    console.error('Get next invoice number error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


