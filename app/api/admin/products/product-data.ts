// Resimdeki ürün verileri - Her ürün için gramaj, fiyat ve stok bilgileri
export interface ProductVariant {
  weight: number // gram cinsinden (veya ml)
  price: number // CAD - gramaj başına fiyat (g veya ml başına)
  package: string
  unit: 'g' | 'ml' // Sadece gram veya mililitre
  stock?: number // Varsayılan 1000g stok
}

export interface ProductGroup {
  baseName: string
  variants: ProductVariant[]
  category?: string
}

// Resimdeki verilerden çıkarılan ürün grupları
export const PRODUCT_GROUPS: ProductGroup[] = [
  {
    baseName: 'Isot Pepper',
    variants: [
      { weight: 50, price: 0.70, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
      { weight: 150, price: 1.42, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
      { weight: 500, price: 3.81, package: 'BÜYÜK PETLER', unit: 'g', stock: 1000 },
      { weight: 2000, price: 13.49, package: 'XL PETLER', unit: 'g', stock: 1000 },
    ],
  },
  {
    baseName: 'Chilli Flakes',
    variants: [
      { weight: 60, price: 0.76, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
      { weight: 150, price: 1.42, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
      { weight: 500, price: 3.45, package: 'BÜYÜK PETLER', unit: 'g', stock: 1000 },
      { weight: 2000, price: 13.90, package: 'XL PETLER', unit: 'g', stock: 1000 },
    ],
  },
  {
    baseName: 'Sweet Paprika Flakes',
    variants: [
      { weight: 50, price: 0.80, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
      { weight: 150, price: 1.76, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
      { weight: 500, price: 4.94, package: 'BÜYÜK PETLER', unit: 'g', stock: 1000 },
    ],
  },
  {
    baseName: 'Sumac',
    variants: [
      { weight: 50, price: 0.70, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
      { weight: 150, price: 1.42, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
      { weight: 600, price: 4.42, package: 'BÜYÜK PETLER', unit: 'g', stock: 1000 },
    ],
  },
  {
    baseName: 'Bay Leaf',
    variants: [
      { weight: 10, price: 0.60, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
      { weight: 8, price: 0.74, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
    ],
  },
  {
    baseName: 'Mint Flakes',
    variants: [
      { weight: 25, price: 0.55, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
      { weight: 60, price: 0.85, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
      { weight: 180, price: 1.80, package: 'BÜYÜK PETLER', unit: 'g', stock: 1000 },
    ],
  },
  {
    baseName: 'Oregano',
    variants: [
      { weight: 15, price: 0.45, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
      { weight: 40, price: 0.89, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
      { weight: 140, price: 2.16, package: 'BÜYÜK PETLER', unit: 'g', stock: 1000 },
      { weight: 500, price: 4.97, package: 'XL PETLER', unit: 'g', stock: 1000 },
    ],
  },
  {
    baseName: 'Cumin Seeds',
    variants: [
      { weight: 40, price: 0.80, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
      { weight: 150, price: 2.17, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
      { weight: 450, price: 5.59, package: 'BÜYÜK PETLER', unit: 'g', stock: 1000 },
    ],
  },
  {
    baseName: 'Black Pepper Ground',
    variants: [
      { weight: 50, price: 1.10, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
      { weight: 150, price: 2.63, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
      { weight: 500, price: 7.85, package: 'BÜYÜK PETLER', unit: 'g', stock: 1000 },
      { weight: 3500, price: 35.50, package: 'XL PETLER', unit: 'g', stock: 1000 },
    ],
  },
  {
    baseName: 'Lemon Sauce',
    variants: [
      { weight: 500, price: 0.61, package: 'SOSLAR', unit: 'ml', stock: 1000 },
      { weight: 1000, price: 0.74, package: 'SOSLAR', unit: 'ml', stock: 1000 },
    ],
  },
  {
    baseName: 'Pomegranate Sauce',
    variants: [
      { weight: 1000, price: 1.66, package: 'SOSLAR', unit: 'ml', stock: 1000 },
    ],
  },
  {
    baseName: 'Black Seed Oil',
    variants: [
      { weight: 250, price: 4.59, package: 'YAĞLAR', unit: 'ml', stock: 1000 },
    ],
  },
  {
    baseName: 'Sesame Oil',
    variants: [
      { weight: 250, price: 4.59, package: 'YAĞLAR', unit: 'ml', stock: 1000 },
    ],
  },
  {
    baseName: 'White Vinegar',
    variants: [
      { weight: 1000, price: 0.74, package: 'SİRKELER', unit: 'ml', stock: 1000 },
    ],
  },
  {
    baseName: 'Apple Vinegar',
    variants: [
      { weight: 1000, price: 0.74, package: 'SİRKELER', unit: 'ml', stock: 1000 },
    ],
  },
  {
    baseName: 'Grape Vinegar',
    variants: [
      { weight: 1000, price: 0.74, package: 'SİRKELER', unit: 'ml', stock: 1000 },
    ],
  },
  // Resimdeki diğer tüm ürünler buraya eklenecek
  // Şimdilik temel yapı hazır, kullanıcı resimdeki tüm verileri ekleyebilir
  // Veya bir script ile otomatik parse edilebilir
]

