// Settings API helper - client-side kullanım için
export async function getTaxRates(): Promise<{ federalTaxRate: number; provincialTaxRate: number }> {
  try {
    const response = await fetch('/api/admin/settings', {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      // Varsayılan değerler
      return { federalTaxRate: 5, provincialTaxRate: 8 }
    }
    
    const data = await response.json()
    return {
      federalTaxRate: parseFloat(data.settings.federalTaxRate) || 5,
      provincialTaxRate: parseFloat(data.settings.provincialTaxRate) || 8,
    }
  } catch (error) {
    console.error('Get tax rates error:', error)
    // Varsayılan değerler
    return { federalTaxRate: 5, provincialTaxRate: 8 }
  }
}



