import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRepository, getDealerRepository, getAdminRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const userRepo = await getUserRepository()
    const dealerRepo = await getDealerRepository()
    const adminRepo = await getAdminRepository()

    // Kullanıcıyı bul
    const user = await userRepo.findOne({
      where: { id },
      relations: ['dealer', 'admin'],
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Kendi kullanıcısını silmeye çalışıyorsa engelle
    if (user.id === auth.userId) {
      return NextResponse.json(
        { error: 'Kendi kullanıcınızı silemezsiniz' },
        { status: 400 }
      )
    }

    // User silindiğinde cascade ile dealer ve admin de silinecek (schema'da onDelete: Cascade)
    await userRepo.remove(user)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


