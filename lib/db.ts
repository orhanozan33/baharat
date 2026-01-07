import 'reflect-metadata'
import { getConnection } from './database'
import { Repository } from 'typeorm'

// Entity'leri import et - metadata yüklenmesi için KRİTİK
// Bu import'lar mutlaka yapılmalı çünkü TypeORM metadata'yı bu import'lardan alır
import { User } from '@/entities/User'
import { Admin } from '@/entities/Admin'
import { Dealer } from '@/entities/Dealer'
import { Category } from '@/entities/Category'
import { Product } from '@/entities/Product'
import { DealerProduct } from '@/entities/DealerProduct'
import { Order } from '@/entities/Order'
import { OrderItem } from '@/entities/OrderItem'
import { Invoice } from '@/entities/Invoice'
import { Payment } from '@/entities/Payment'
import { Check } from '@/entities/Check'
import { Settings } from '@/entities/Settings'
void Settings // Metadata yüklenmesi için

// Repository helper fonksiyonları - Performance optimized
export async function getUserRepository(): Promise<Repository<User>> {
  const connection = await getConnection()
  return connection.getRepository('User') as Repository<User>
}

export async function getAdminRepository(): Promise<Repository<Admin>> {
  const connection = await getConnection()
  try {
    return connection.getRepository(Admin)
  } catch (error: any) {
    return connection.getRepository('Admin') as Repository<Admin>
  }
}

export async function getDealerRepository(): Promise<Repository<Dealer>> {
  const connection = await getConnection()
  return connection.getRepository('Dealer') as Repository<Dealer>
}

export async function getCategoryRepository(): Promise<Repository<Category>> {
  const connection = await getConnection()
  return connection.getRepository('Category') as Repository<Category>
}

export async function getProductRepository(): Promise<Repository<Product>> {
  const connection = await getConnection()
  return connection.getRepository('Product') as Repository<Product>
}

export async function getDealerProductRepository(): Promise<Repository<DealerProduct>> {
  const connection = await getConnection()
  return connection.getRepository('DealerProduct') as Repository<DealerProduct>
}

export async function getOrderRepository(): Promise<Repository<Order>> {
  const connection = await getConnection()
  return connection.getRepository('Order') as Repository<Order>
}

export async function getOrderItemRepository(): Promise<Repository<OrderItem>> {
  const connection = await getConnection()
  return connection.getRepository('OrderItem') as Repository<OrderItem>
}

export async function getInvoiceRepository(): Promise<Repository<Invoice>> {
  const connection = await getConnection()
  return connection.getRepository('Invoice') as Repository<Invoice>
}

export async function getPaymentRepository(): Promise<Repository<Payment>> {
  const connection = await getConnection()
  return connection.getRepository('Payment') as Repository<Payment>
}

export async function getCheckRepository(): Promise<Repository<Check>> {
  const connection = await getConnection()
  return connection.getRepository('Check') as Repository<Check>
}

export async function getSettingsRepository(): Promise<Repository<Settings>> {
  const connection = await getConnection()
  return connection.getRepository('Settings') as Repository<Settings>
}

