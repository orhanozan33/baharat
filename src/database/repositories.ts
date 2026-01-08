// reflect-metadata EN ÜSTTE olmalı
import 'reflect-metadata'
import { connectDB } from './typeorm'
import { Repository } from 'typeorm'

// Entity'leri import et - metadata yüklenmesi için KRİTİK
// Bu import'lar mutlaka yapılmalı çünkü TypeORM metadata'yı bu import'lardan alır
import { User } from './entities/User'
import { Admin } from './entities/Admin'
import { Dealer } from './entities/Dealer'
import { Category } from './entities/Category'
import { Product } from './entities/Product'
import { DealerProduct } from './entities/DealerProduct'
import { Order } from './entities/Order'
import { OrderItem } from './entities/OrderItem'
import { Invoice } from './entities/Invoice'
import { Payment } from './entities/Payment'
import { Check } from './entities/Check'
import { Settings } from './entities/Settings'

// Metadata yüklenmesi için entity'leri referans et
void User
void Admin
void Dealer
void Category
void Product
void DealerProduct
void Order
void OrderItem
void Invoice
void Payment
void Check
void Settings

// Repository helper fonksiyonları - Performance optimized
export async function getUserRepository(): Promise<Repository<User>> {
  const connection = await connectDB()
  // Entity class kullan - metadata yüklendi
  return connection.getRepository(User)
}

export async function getAdminRepository(): Promise<Repository<Admin>> {
  const connection = await connectDB()
  // Entity class kullan - metadata yüklendi
  return connection.getRepository(Admin)
}

export async function getDealerRepository(): Promise<Repository<Dealer>> {
  const connection = await connectDB()
  return connection.getRepository(Dealer)
}

export async function getCategoryRepository(): Promise<Repository<Category>> {
  const connection = await connectDB()
  // Entity class kullan - metadata yüklendi
  return connection.getRepository(Category)
}

export async function getProductRepository(): Promise<Repository<Product>> {
  const connection = await connectDB()
  // Entity class kullan - metadata yüklendi
  return connection.getRepository(Product)
}

export async function getDealerProductRepository(): Promise<Repository<DealerProduct>> {
  const connection = await connectDB()
  return connection.getRepository(DealerProduct)
}

export async function getOrderRepository(): Promise<Repository<Order>> {
  const connection = await connectDB()
  return connection.getRepository(Order)
}

export async function getOrderItemRepository(): Promise<Repository<OrderItem>> {
  const connection = await connectDB()
  return connection.getRepository(OrderItem)
}

export async function getInvoiceRepository(): Promise<Repository<Invoice>> {
  const connection = await connectDB()
  return connection.getRepository(Invoice)
}

export async function getPaymentRepository(): Promise<Repository<Payment>> {
  const connection = await connectDB()
  return connection.getRepository(Payment)
}

export async function getCheckRepository(): Promise<Repository<Check>> {
  const connection = await connectDB()
  return connection.getRepository(Check)
}

export async function getSettingsRepository(): Promise<Repository<Settings>> {
  const connection = await connectDB()
  return connection.getRepository(Settings)
}

