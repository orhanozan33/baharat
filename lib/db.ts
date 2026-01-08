// Legacy export - redirect to new location
// TODO: Update all imports to use @/src/database/repositories
export * from '@/src/database/repositories'

// Export connectDB from typeorm
export { connectDB, AppDataSource } from '@/src/database/typeorm'
