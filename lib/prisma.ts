// Stub file for Prisma - not used, but prevents build errors
// This project uses TypeORM instead of Prisma

export const prisma = {
  // Empty stub to prevent import errors
  user: { findUnique: () => null, findMany: () => [], create: () => null },
  order: { findUnique: () => null, findMany: () => [], create: () => null },
  product: { findUnique: () => null, findMany: () => [], create: () => null },
  category: { findUnique: () => null, findMany: () => [], create: () => null },
  dealer: { findUnique: () => null, findMany: () => [], create: () => null },
} as any

// Export default for compatibility
export default prisma

