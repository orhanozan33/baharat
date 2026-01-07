// Slug oluşturma fonksiyonu
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/[^\w\-]+/g, '') // Özel karakterleri kaldır
    .replace(/\-\-+/g, '-') // Çoklu tireleri tek tire yap
    .replace(/^-+/, '') // Başlangıçtaki tireleri kaldır
    .replace(/-+$/, '') // Sondaki tireleri kaldır
}

// Türkçe karakterleri dönüştür
export function turkishToEnglish(text: string): string {
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  }
  
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => turkishChars[char] || char)
}

// Slug oluştur (Türkçe karakterleri de dönüştür)
export function createSlug(text: string): string {
  const englishText = turkishToEnglish(text)
  return slugify(englishText)
}

// Ürün adından gramaj bilgisini çıkar
export function extractWeightFromName(name: string): { weight: number; unit: string } | null {
  if (!name) return null
  
  const patterns = [
    { regex: /(\d+\.?\d*)\s*(kg|kilogram)\b/i, multiplier: 1000, unit: 'g' },
    { regex: /(\d+\.?\d*)\s*(g|gr|gram)\b/i, multiplier: 1, unit: 'g' },
    { regex: /(\d+\.?\d*)\s*(ml|litre|lt)\b/i, multiplier: 1, unit: 'ml' },
  ]
  
  for (const pattern of patterns) {
    const match = name.match(pattern.regex)
    if (match) {
      const value = parseFloat(match[1])
      return {
        weight: value * pattern.multiplier,
        unit: pattern.unit,
      }
    }
  }
  
  return null
}

// Ürün adından temel ismi çıkar (gramaj, ml, kg, g gibi bilgileri kaldır)
export function extractBaseProductName(productName: string): string {
  if (!productName) return ''
  
  // Ürün adını normalize et
  let normalized = productName.trim()
  
  // Gramaj bilgilerini kaldır (örn: "50g", "100ml", "2kg", "2000g", "1.5kg")
  // Önce sonundaki gramaj bilgilerini kaldır
  normalized = normalized
    .replace(/\s*\d+\.?\d*\s*(g|ml|kg|gr|gram|kilogram|litre|lt)\s*$/gi, '')
    .replace(/\s*\d+\.?\d*\s*(g|ml|kg|gr|gram|kilogram|litre|lt)\s+/gi, ' ')
  
  // Parantez içindekileri kaldır
  normalized = normalized.replace(/\s*\([^)]*\)\s*/g, ' ')
  
  // Paket tiplerini kaldır (örn: "XL PETLER", "ZİPLİ AMBALAJ")
  normalized = normalized
    .replace(/\s*-\s*(ZİPLİ|ORTA|BÜYÜK|XL|PETLER|AMBALAJ|SOSLAR|YAĞLAR|SİRKELER|KOVALAR|STANTLAR|BİTKİ\s*ÇAYLARI).*$/i, '')
    .replace(/\s*(ZİPLİ|ORTA|BÜYÜK|XL)\s*(PETLER|AMBALAJ).*$/i, '')
  
  // Fazla boşlukları temizle
  normalized = normalized.replace(/\s+/g, ' ').trim()
  
  return normalized
}

// İki ürün adının aynı temel ürünü temsil edip etmediğini kontrol et
export function isSameBaseProduct(name1: string, name2: string): boolean {
  const base1 = extractBaseProductName(name1).toLowerCase()
  const base2 = extractBaseProductName(name2).toLowerCase()
  return base1 === base2 && base1.length > 0
}

// Fiyat formatlama - $ sembolü ile (binlik ayırıcı: virgül, ondalık: nokta)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}
