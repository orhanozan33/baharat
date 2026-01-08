import 'reflect-metadata'
import { getSettingsRepository } from '../lib/db'

async function updateReceiptSettings() {
  try {
    const settingsRepo = await getSettingsRepository()

    const settings = {
      companyName: 'Epice Buhara',
      companyAddress: '182 Rue de Noirmoutier Laval, QC H7N 5H2',
      companyPhone: '+1 (514) 726-7067',
      companyTaxNumber: 'NW-s828743862874811',
    }

    const upsertSetting = async (key: string, value: string) => {
      let setting = await settingsRepo.findOne({ where: { key } })
      if (setting) {
        setting.value = value
        await settingsRepo.save(setting)
        console.log(`✅ Updated: ${key} = ${value}`)
      } else {
        setting = settingsRepo.create({ key, value })
        await settingsRepo.save(setting)
        console.log(`✅ Created: ${key} = ${value}`)
      }
      return setting
    }

    await upsertSetting('companyName', settings.companyName)
    await upsertSetting('companyAddress', settings.companyAddress)
    await upsertSetting('companyPhone', settings.companyPhone)
    await upsertSetting('companyTaxNumber', settings.companyTaxNumber)

    console.log('\n✅ Receipt settings updated successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating receipt settings:', error)
    process.exit(1)
  }
}

updateReceiptSettings()


