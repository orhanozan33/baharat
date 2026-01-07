// Stub file for Prisma - prevents build errors
// This project uses TypeORM instead of Prisma

// Export a complete stub that matches Prisma Client API
export const prisma = {
  user: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    count: () => Promise.resolve(0),
  },
  order: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    count: () => Promise.resolve(0),
    aggregate: () => Promise.resolve({ _sum: { total: 0 } }),
    groupBy: () => Promise.resolve([]),
  },
  product: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    count: () => Promise.resolve(0),
  },
  category: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    count: () => Promise.resolve(0),
  },
  dealer: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    count: () => Promise.resolve(0),
  },
  orderItem: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    count: () => Promise.resolve(0),
    groupBy: () => Promise.resolve([]),
  },
} as any

// Default export for compatibility
export default prisma
