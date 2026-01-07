import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env dosyasını yükle
config({ path: resolve(process.cwd(), '.env') })

import { getConnection } from '../lib/database'
import { getCategoryRepository, getProductRepository, getOrderItemRepository } from '../lib/db'

// Slug oluşturma helper
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Scientific notation'ı düzeltme
function fixScientificNotation(value: string): string {
  if (!value || value.trim() === '') return ''
  // 1,21191E+11 gibi değerleri düzelt
  if (value.includes('E+') || value.includes('e+') || value.includes('E-') || value.includes('e-')) {
    const num = parseFloat(value.replace(/,/g, ''))
    if (!isNaN(num)) {
      return Math.round(num).toString()
    }
  }
  // Virgülleri kaldır
  return value.replace(/,/g, '')
}

// Fiyat temizleme
function cleanPrice(priceStr: string): number | null {
  if (!priceStr || priceStr.trim() === '') return null
  
  // Garip karakterleri temizle (1.Eki, Oca.76 gibi)
  let cleaned = priceStr.trim()
  
  // Ay isimlerini temizle (Oca, Eki, May gibi)
  cleaned = cleaned.replace(/Oca\./gi, '')
  cleaned = cleaned.replace(/Eki\./gi, '')
  cleaned = cleaned.replace(/May\./gi, '')
  cleaned = cleaned.replace(/[^0-9.]/g, '')
  
  const price = parseFloat(cleaned)
  return isNaN(price) ? null : price
}

interface ProductData {
  category: string
  name: string
  weight: number | null
  stock: number
  price: number | null
  sku: string
  unit: 'g' | 'ml' | 'kg'
}

async function importProducts() {
  try {
    console.log('🚀 Ürün içe aktarma işlemi başlıyor...')

    const connection = await getConnection()
    const categoryRepo = await getCategoryRepository()
    const productRepo = await getProductRepository()
    const orderItemRepo = await getOrderItemRepository()

    // Önce order items'ı sil (foreign key constraint'i nedeniyle)
    console.log('🗑️ Sipariş itemları siliniyor...')
    const allOrderItems = await orderItemRepo.find()
    if (allOrderItems.length > 0) {
      await orderItemRepo.remove(allOrderItems)
      console.log(`✅ ${allOrderItems.length} sipariş itemı silindi`)
    }

    // Sonra tüm ürünleri sil
    console.log('🗑️ Mevcut ürünler siliniyor...')
    const allProducts = await productRepo.find()
    if (allProducts.length > 0) {
      await productRepo.remove(allProducts)
      console.log(`✅ ${allProducts.length} ürün silindi`)
    }

    // Ürün verileri
    const productsData: ProductData[] = [
      // ZİPLİ AMBALAJ
      { category: 'ZİPLİ AMBALAJ', name: 'Isot Pepper', weight: 50, stock: 400, price: 0.70, sku: '90422000011', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Chili Flakes', weight: 60, stock: 400, price: 0.76, sku: '90422000011', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Sweet Paprika Flakes', weight: 50, stock: 400, price: 0.80, sku: '90422000011', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Sumac', weight: 50, stock: 400, price: 0.70, sku: '91099910013', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Chili Flakes Extra Hot', weight: 50, stock: 200, price: 0.82, sku: '90422000011', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Chili Powder', weight: 40, stock: 400, price: 0.65, sku: '90422000011', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Sweet Paprika Powder', weight: 40, stock: 400, price: 0.70, sku: '90422000011', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Bay Leaf', weight: 10, stock: 400, price: 0.60, sku: '91099500000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Mint flakes', weight: 25, stock: 400, price: 0.55, sku: '121191000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Oregano', weight: 15, stock: 400, price: 0.45, sku: '91099390000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Fenugreek Seeds', weight: 50, stock: 200, price: 0.41, sku: '91099100000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Fenugreek Powder', weight: 60, stock: 200, price: 0.44, sku: '91099100000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Cumin Seeds', weight: 40, stock: 400, price: 0.80, sku: '90931000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Cumin Ground', weight: 50, stock: 400, price: 0.90, sku: '90932000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Coriander Seeds', weight: 20, stock: 400, price: 0.34, sku: '90921000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Coriander Powder', weight: 50, stock: 400, price: 0.41, sku: '90922000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Sesame', weight: 60, stock: 400, price: 0.54, sku: '120741000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Black Seeds', weight: 60, stock: 400, price: 0.55, sku: '91099910014', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Blue Poppy Seeds', weight: 60, stock: 200, price: 0.71, sku: '110430000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Shredded Coconut', weight: 40, stock: 200, price: 0.75, sku: '80111000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Sesame Roasted', weight: 60, stock: 200, price: 0.62, sku: '120741000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Cinnamon Sticks', weight: 40, stock: 400, price: 0.90, sku: '90620000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Cinnamon Powder', weight: 40, stock: 200, price: 0.92, sku: '90620000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Black Pepper Ground', weight: 50, stock: 400, price: 1.00, sku: '90412000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Black Pepper Coarse', weight: 30, stock: 400, price: 0.80, sku: '90412000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Black Peppercorns', weight: 50, stock: 400, price: 1.00, sku: '90411000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Cloves', weight: 30, stock: 400, price: 0.85, sku: '90710000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Cloves Ground', weight: 30, stock: 200, price: 0.80, sku: '90720000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Garlic Powder', weight: 30, stock: 200, price: 0.64, sku: '71290900011', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Onion Powder', weight: 30, stock: 200, price: 0.61, sku: '71220000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Allspice Powder', weight: 30, stock: 200, price: 0.85, sku: '90422000012', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Ginger Powder', weight: 50, stock: 400, price: 0.80, sku: '91012000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Turmeric Powder', weight: 50, stock: 400, price: 0.61, sku: '91030000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Baking soda', weight: 80, stock: 400, price: 0.37, sku: '283630000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Citric Acid Powder', weight: 100, stock: 400, price: 0.70, sku: '291815000000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Meat Seasoning', weight: 50, stock: 400, price: 0.58, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Garam Masala', weight: 60, stock: 100, price: 0.92, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Kerrie Masala', weight: 60, stock: 400, price: 0.65, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Curry', weight: 50, stock: 400, price: 0.68, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Hot Madras Curry', weight: 50, stock: 200, price: 0.68, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Barbecue Seasoning', weight: 50, stock: 400, price: 0.50, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Fries Seasoning', weight: 50, stock: 200, price: 0.58, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Ras El Hanout', weight: 50, stock: 200, price: 0.61, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Garlic Mix', weight: 50, stock: 200, price: 0.58, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: 'Chicken Seasoning', weight: 60, stock: 400, price: 0.48, sku: '91091900000', unit: 'g' },
      { category: 'ZİPLİ AMBALAJ', name: '7 spice', weight: 50, stock: 400, price: 0.72, sku: '91091900000', unit: 'g' },
      
      // ORTA PETLER
      { category: 'ORTA PETLER', name: 'Isot Pepper', weight: 150, stock: 240, price: null, sku: '90422000011', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Chili Flakes', weight: 150, stock: 600, price: null, sku: '90422000011', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Sweet Paprika Flakes', weight: 150, stock: 360, price: null, sku: '90422000011', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Sumac', weight: 150, stock: 600, price: null, sku: '91099910013', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Sumac Whole', weight: 100, stock: 120, price: null, sku: '91099910013', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Chili Flakes Extra Hot', weight: 150, stock: 240, price: null, sku: '90422000011', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Chili Powder', weight: 150, stock: 600, price: null, sku: '90422000011', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Sweet Paprika Powder', weight: 150, stock: 600, price: 0.76, sku: '90422000011', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Bay Leaf', weight: 8, stock: 360, price: 0.74, sku: '91099500000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Mint flakes', weight: 60, stock: 600, price: 0.85, sku: '121191000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Thyme', weight: 60, stock: 240, price: 0.99, sku: '91099310000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Oregano', weight: 40, stock: 600, price: 0.89, sku: '91099390000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Fenugreek Seeds', weight: 250, stock: 240, price: null, sku: '91099100000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Fenugreek Powder', weight: 200, stock: 240, price: 0.99, sku: '91099100000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Chia Seeds', weight: 200, stock: 120, price: null, sku: '120800000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Caraway Seeds', weight: 150, stock: 360, price: null, sku: '90962000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Flaxseed', weight: 200, stock: 240, price: null, sku: '120401000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Cumin Seeds', weight: 150, stock: 600, price: null, sku: '90931000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Cumin Ground', weight: 180, stock: 600, price: null, sku: '90932000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Coriander Seeds', weight: 70, stock: 600, price: 0.75, sku: '90921000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Coriander Powder', weight: 150, stock: 600, price: 0.87, sku: '90922000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Sesame', weight: 180, stock: 600, price: null, sku: '120741000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Black Seeds', weight: 180, stock: 600, price: null, sku: '91099910014', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Blue Poppy Seeds', weight: 180, stock: 240, price: null, sku: '110430000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Shredded Coconut', weight: 120, stock: 240, price: null, sku: '80111000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Sesame&Black Seeds', weight: 180, stock: 600, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Sesame Roasted', weight: 180, stock: 240, price: null, sku: '120741000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'White Peppercorns', weight: 150, stock: 240, price: null, sku: '90422000018', unit: 'g' },
      { category: 'ORTA PETLER', name: 'White Pepper Ground', weight: 150, stock: 240, price: null, sku: '90422000018', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Cinnamon Sticks', weight: 60, stock: 600, price: null, sku: '90620000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Cinnamon Powder', weight: 150, stock: 240, price: null, sku: '90620000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Black Pepper Ground', weight: 150, stock: 600, price: null, sku: '90412000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Black Pepper Coarse', weight: 150, stock: 240, price: null, sku: '90412000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Black Peppercorns', weight: 150, stock: 240, price: null, sku: '90411000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Cloves', weight: 90, stock: 600, price: null, sku: '90710000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Cloves Ground', weight: 170, stock: 240, price: null, sku: '90720000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Garlic Granules', weight: 180, stock: 240, price: null, sku: '71290900011', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Garlic Powder', weight: 130, stock: 240, price: null, sku: '71290900011', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Onion Powder', weight: 140, stock: 240, price: null, sku: '71220000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Allspice Whole', weight: 100, stock: 120, price: null, sku: '90422000012', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Allspice Powder', weight: 150, stock: 120, price: null, sku: '90422000012', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Star Anise', weight: 60, stock: 120, price: null, sku: '90962000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Ginger Powder', weight: 150, stock: 600, price: 2.00, sku: '91012000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Turmeric Powder', weight: 150, stock: 600, price: null, sku: '91030000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Sea Salt Powder', weight: 350, stock: 120, price: 0.88, sku: '250101000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Himalayan Salt Powder', weight: 350, stock: 120, price: null, sku: '250101000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Baking soda', weight: 350, stock: 360, price: 0.91, sku: '283630000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Rock Salt Powder', weight: 350, stock: 120, price: null, sku: '250101000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Citric Acid Powder', weight: 300, stock: 600, price: null, sku: '291815000000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Biryani Masala', weight: 160, stock: 360, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Doner Seasoning', weight: 160, stock: 240, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Meat Seasoning', weight: 150, stock: 360, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Garam Masala', weight: 180, stock: 360, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Kofta Seasoning', weight: 180, stock: 240, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Curry', weight: 150, stock: 600, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Hot Madras Curry', weight: 160, stock: 240, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Barbecue Seasoning', weight: 200, stock: 360, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Merguez Sausage Seasoning', weight: 160, stock: 360, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Fries Seasoning', weight: 160, stock: 120, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Rice Seasoning', weight: 180, stock: 240, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Tandoori Masala', weight: 160, stock: 360, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: 'Chicken Seasoning', weight: 200, stock: 360, price: null, sku: '91091900000', unit: 'g' },
      { category: 'ORTA PETLER', name: '7 spice', weight: 150, stock: 600, price: null, sku: '91091900000', unit: 'g' },
      
      // BÜYÜK PETLER
      { category: 'BÜYÜK PETLER', name: 'Isot Pepper', weight: 500, stock: 60, price: null, sku: '90422000011', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Chili Flakes', weight: 500, stock: 120, price: null, sku: '90422000011', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Sweet Paprika Flakes', weight: 500, stock: 120, price: null, sku: '90422000011', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Sumac', weight: 600, stock: 120, price: null, sku: '91099910013', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Chili Powder', weight: 500, stock: 120, price: null, sku: '90422000011', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Sweet Paprika Powder', weight: 400, stock: 120, price: null, sku: '90422000011', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Rosemary Leaves', weight: 270, stock: 60, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Parsley Flakes', weight: 150, stock: 180, price: null, sku: '71290900029', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Mint flakes', weight: 180, stock: 120, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Oregano', weight: 140, stock: 240, price: null, sku: '91099390000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Cumin Seeds', weight: 450, stock: 120, price: null, sku: '90931000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Cumin Ground', weight: 500, stock: 120, price: null, sku: '90932000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Coriander Seeds', weight: 250, stock: 120, price: null, sku: '90921000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Coriander Powder', weight: 400, stock: 120, price: null, sku: '90922000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Sesame', weight: 500, stock: 120, price: null, sku: '120741000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Black Seeds', weight: 500, stock: 120, price: null, sku: '91099910014', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Shredded Coconut', weight: 350, stock: 60, price: null, sku: '80111000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Sesame&Black Seeds', weight: 500, stock: 60, price: null, sku: '91091900000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Black Pepper Ground', weight: 500, stock: 180, price: null, sku: '90412000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Cloves', weight: 350, stock: 120, price: null, sku: '90710000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Onion Powder', weight: 350, stock: 180, price: null, sku: '71220000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Baking soda', weight: 1200, stock: 120, price: null, sku: '283630000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Citric Acid Powder', weight: 900, stock: 120, price: null, sku: '291815000000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Curry', weight: 500, stock: 120, price: null, sku: '91091900000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Barbecue Seasoning', weight: 700, stock: 60, price: null, sku: '91091900000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Fries Seasoning', weight: 600, stock: 60, price: null, sku: '91091900000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: 'Chicken Seasoning', weight: 700, stock: 60, price: null, sku: '91091900000', unit: 'g' },
      { category: 'BÜYÜK PETLER', name: '7 spice', weight: 500, stock: 60, price: null, sku: '91091900000', unit: 'g' },
      
      // SOSLAR
      { category: 'SOSLAR', name: 'LEMON SAUCE', weight: 1000, stock: 240, price: 0.74, sku: '210391000000', unit: 'ml' },
      { category: 'SOSLAR', name: 'LEMON SAUCE', weight: 500, stock: 240, price: 0.61, sku: '210391000000', unit: 'ml' },
      { category: 'SOSLAR', name: 'POMEGRANATE SAUCE', weight: 1000, stock: 240, price: null, sku: '210391000000', unit: 'ml' },
      
      // YAĞLAR
      { category: 'YAĞLAR', name: 'BLACK SEED OIL', weight: 250, stock: 120, price: null, sku: '151621000000', unit: 'ml' },
      { category: 'YAĞLAR', name: 'SESAME OIL', weight: 250, stock: 120, price: null, sku: '151621000000', unit: 'ml' },
      
      // SİRKELER
      { category: 'SİRKELER', name: 'WHITE VINEGAR', weight: 1000, stock: 120, price: 0.74, sku: '220901000000', unit: 'ml' },
      { category: 'SİRKELER', name: 'APPLE VINEGAR', weight: 1000, stock: 120, price: 0.74, sku: '220901000000', unit: 'ml' },
      { category: 'SİRKELER', name: 'GRAPE VINEGAR', weight: 1000, stock: 120, price: 0.74, sku: '220901000000', unit: 'ml' },
      
      // KOVALAR
      { category: 'KOVALAR', name: 'Sweet Paprika Powder', weight: 5000, stock: 50, price: 44.19, sku: '90422000011', unit: 'g' },
      { category: 'KOVALAR', name: 'Parsley Flakes', weight: 1500, stock: 50, price: null, sku: '71290900029', unit: 'g' },
      { category: 'KOVALAR', name: 'Oregano', weight: 1500, stock: 50, price: 17.31, sku: '91099390000', unit: 'g' },
      { category: 'KOVALAR', name: 'Black Pepper Ground', weight: 5000, stock: 20, price: 73.30, sku: '90412000000', unit: 'g' },
      
      // XL PETLER
      { category: 'XL PETLER', name: 'Chili Powder', weight: 2000, stock: 80, price: 13.49, sku: '90422000011', unit: 'g' },
      { category: 'XL PETLER', name: 'Sweet Paprika Powder', weight: 2000, stock: 120, price: 16.90, sku: '90422000011', unit: 'g' },
      { category: 'XL PETLER', name: 'Isot Pepper', weight: 2000, stock: 36, price: 13.49, sku: '90422000011', unit: 'g' },
      { category: 'XL PETLER', name: 'Oregano', weight: 500, stock: 100, price: null, sku: '91099390000', unit: 'g' },
      { category: 'XL PETLER', name: 'Parsley Flakes', weight: 600, stock: 100, price: null, sku: '71290900029', unit: 'g' },
      { category: 'XL PETLER', name: 'Cumin Ground', weight: 2500, stock: 100, price: 24.00, sku: '90932000000', unit: 'g' },
      { category: 'XL PETLER', name: 'Black Pepper Ground', weight: 2500, stock: 100, price: 35.50, sku: '90412000000', unit: 'g' },
      { category: 'XL PETLER', name: 'White Pepper Ground', weight: 2500, stock: 40, price: 42.60, sku: '90422000018', unit: 'g' },
      { category: 'XL PETLER', name: 'Garlic Powder', weight: 2000, stock: 80, price: 17.75, sku: '71290900011', unit: 'g' },
      { category: 'XL PETLER', name: 'Onion Powder', weight: 2000, stock: 80, price: null, sku: '71220000000', unit: 'g' },
      { category: 'XL PETLER', name: 'Chili Flakes', weight: 2000, stock: 60, price: 13.90, sku: '90422000011', unit: 'g' },
      { category: 'XL PETLER', name: 'Chili Flakes', weight: 2000, stock: 60, price: 13.50, sku: '90422000011', unit: 'g' },
      
      // STANTLAR
      { category: 'STANTLAR', name: 'STANDARD SPICE SHELF', weight: 55000, stock: 7, price: 14.20, sku: '940389000000', unit: 'g' },
      
      // BİTKİ ÇAYLARI
      { category: 'BİTKİ ÇAYLARI', name: 'Sage Tea', weight: 30, stock: 144, price: 0.80, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Lınden Tea', weight: 30, stock: 72, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Rosemary Leaves', weight: 80, stock: 72, price: 0.91, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Cinnamon Sticks', weight: 80, stock: 72, price: null, sku: '90620000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Bay Leaf', weight: 15, stock: 144, price: 0.74, sku: '91099500000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Wild Thyme', weight: 50, stock: 72, price: 1.00, sku: '91099310000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Flaxseed', weight: 250, stock: 72, price: null, sku: '120401000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Rosehip Tea', weight: 150, stock: 72, price: 2.00, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Melissa(lemon balm)', weight: 30, stock: 72, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Hibiscus', weight: 70, stock: 72, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Chamomile', weight: 40, stock: 144, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Fennel', weight: 150, stock: 72, price: null, sku: '90962000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Green Tea', weight: 100, stock: 72, price: null, sku: '90210000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Gınger Whole', weight: 200, stock: 72, price: null, sku: '91012000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Turmerıc Whole', weight: 200, stock: 72, price: null, sku: '91030000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Wınter Tea', weight: 100, stock: 72, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Form Tea', weight: 80, stock: 72, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Lavander', weight: 60, stock: 72, price: 0.89, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Yarrow', weight: 30, stock: 72, price: 0.85, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Echinacea-Basıl', weight: 50, stock: 72, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Anise Seeds', weight: 180, stock: 72, price: null, sku: '90962000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Cherry Stem', weight: 40, stock: 72, price: 0.89, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Chıa Seeds', weight: 200, stock: 72, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Rose Buds', weight: 30, stock: 72, price: null, sku: '121191000000', unit: 'g' },
      { category: 'BİTKİ ÇAYLARI', name: 'Purple Basil', weight: 30, stock: 72, price: null, sku: '71290900029', unit: 'g' },
    ]

    // Kategorileri oluştur
    const categoryMap = new Map<string, any>()
    const categoryNames = [
      'ZİPLİ AMBALAJ',
      'ORTA PETLER',
      'BÜYÜK PETLER',
      'SOSLAR',
      'YAĞLAR',
      'SİRKELER',
      'KOVALAR',
      'XL PETLER',
      'STANTLAR',
      'BİTKİ ÇAYLARI',
    ]

    console.log('📁 Kategoriler oluşturuluyor...')
    for (let i = 0; i < categoryNames.length; i++) {
      const catName = categoryNames[i]
      const catSlug = createSlug(catName)
      
      let category = await categoryRepo.findOne({ where: { slug: catSlug } })
      if (!category) {
        category = categoryRepo.create({
          name: catName,
          slug: catSlug,
          isActive: true,
          order: i,
        })
        category = await categoryRepo.save(category)
        console.log(`✅ Kategori oluşturuldu: ${catName}`)
      } else {
        console.log(`ℹ️ Kategori zaten mevcut: ${catName}`)
      }
      categoryMap.set(catName, category)
    }

    // Ürünleri oluştur
    console.log('📦 Ürünler oluşturuluyor...')
    let successCount = 0
    let errorCount = 0

    for (const productData of productsData) {
      try {
        const category = categoryMap.get(productData.category)
        if (!category) {
          console.error(`❌ Kategori bulunamadı: ${productData.category}`)
          errorCount++
          continue
        }

        // SKU'yu düzelt
        let cleanSku = fixScientificNotation(productData.sku)
        
        // Ürün adını oluştur (baseName + weight + unit)
        const displayUnit = productData.unit === 'g' ? 'GR' : productData.unit === 'kg' ? 'KG' : productData.unit.toUpperCase()
        const productName = productData.weight 
          ? `${productData.name} ${productData.weight}${displayUnit}`
          : productData.name
        
        const slug = createSlug(productName)
        
        // Fiyat kontrolü - null ise 0 kullan
        const price = productData.price ?? 0

        // Slug'un benzersiz olup olmadığını kontrol et
        const existing = await productRepo.findOne({ where: { slug } })
        if (existing) {
          console.log(`⚠️ Ürün zaten mevcut (slug): ${productName} - atlanıyor`)
          continue
        }

        // SKU'nun benzersiz olup olmadığını kontrol et - aynı SKU varsa suffix ekle
        let finalSku = cleanSku
        let skuCounter = 1
        while (await productRepo.findOne({ where: { sku: finalSku } })) {
          finalSku = `${cleanSku}-${skuCounter}`
          skuCounter++
        }

        const product = productRepo.create({
          name: productName,
          baseName: productData.name,
          slug: slug,
          sku: finalSku,
          price: price,
          stock: productData.stock,
          weight: productData.weight,
          unit: productData.unit,
          categoryId: category.id,
          isActive: true,
          trackStock: true,
        })

        await productRepo.save(product)
        console.log(`✅ Ürün oluşturuldu: ${productName} (${productData.stock} adet, ${price} $)`)
        successCount++
      } catch (error: any) {
        console.error(`❌ Hata (${productData.name}):`, error.message)
        errorCount++
      }
    }

    console.log('\n📊 Özet:')
    console.log(`✅ Başarılı: ${successCount}`)
    console.log(`❌ Hatalı: ${errorCount}`)
    console.log(`📦 Toplam: ${productsData.length}`)

    await connection.destroy()
    process.exit(0)
  } catch (error) {
    console.error('❌ Genel hata:', error)
    process.exit(1)
  }
}

importProducts()

