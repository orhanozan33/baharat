# Refactoring Plan - Klasör Yapısı Düzenleme

## Yeni Yapı

```
BAHARTA/
├── app/                          # Next.js App Router (değişmez)
│   ├── api/                      # API Routes (backend endpoints)
│   ├── [locale]/                 # Public frontend pages
│   ├── admin/                    # Admin pages
│   └── dealer/                   # Dealer pages
│
├── src/
│   ├── backend/                  # Backend Logic
│   │   ├── services/             # Business logic services
│   │   ├── auth/                 # Authentication
│   │   │   ├── auth.ts
│   │   │   └── auth-helpers.ts
│   │   └── utils/                # Backend utilities
│   │       ├── utils-uuid.ts
│   │       └── serialize.ts
│   │
│   ├── database/                 # Database Layer
│   │   ├── entities/             # TypeORM entities
│   │   │   └── enums/
│   │   ├── connection.ts         # Database connection
│   │   └── repositories.ts       # Repository helpers
│   │
│   └── frontend/                 # Frontend
│       ├── components/           # React components
│       │   ├── admin/
│       │   ├── dealer/
│       │   └── shared/
│       ├── hooks/                # Custom hooks
│       ├── contexts/             # React contexts
│       └── utils/                # Frontend utilities
│
├── lib/                          # Legacy (deprecated, will remove)
├── components/                   # Legacy (will move to src/frontend/components)
├── entities/                     # Legacy (will move to src/database/entities)
├── hooks/                        # Legacy (will move to src/frontend/hooks)
├── contexts/                     # Legacy (will move to src/frontend/contexts)
│
├── messages/                     # i18n translations (stays)
├── public/                       # Static files (stays)
├── scripts/                      # Utility scripts (stays)
│
└── Config files (root)
```

## Migration Steps

1. Create new folder structure
2. Move database files (entities, lib/database.ts, lib/db.ts)
3. Move backend files (lib/auth*, lib/utils*, lib/serialize*)
4. Move frontend files (components, hooks, contexts)
5. Update all import paths
6. Update tsconfig.json paths
7. Test build
8. Remove legacy folders

