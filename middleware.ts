import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n'
import { isValidLocale } from './lib/i18n'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // API route'larını middleware'den geçirme
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Static files ve Next.js internal routes - daha geniş kontrol
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next()
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Admin ve Dealer routes için kontrol (login sayfaları hariç)
  if ((pathname.startsWith('/admin') || pathname.startsWith('/dealer')) 
      && !pathname.includes('/login')) {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      if (pathname.startsWith('/dealer')) {
        return NextResponse.redirect(new URL('/dealer/login', request.url))
      }
    }

    // Check if user is admin/dealer
    try {
      const userResponse = await fetch(`${request.nextUrl.origin}/api/auth/check-role`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      })

      if (!userResponse.ok) {
        if (pathname.startsWith('/admin')) {
          return NextResponse.redirect(new URL('/admin/login', request.url))
        }
        if (pathname.startsWith('/dealer')) {
          return NextResponse.redirect(new URL('/dealer/login', request.url))
        }
      }

      const { role } = await userResponse.json()
      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      if (pathname.startsWith('/dealer') && role !== 'DEALER') {
        return NextResponse.redirect(new URL('/dealer/login', request.url))
      }
    } catch {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      if (pathname.startsWith('/dealer')) {
        return NextResponse.redirect(new URL('/dealer/login', request.url))
      }
    }

    return NextResponse.next()
  }

  // Login sayfaları için authentication kontrolü yok - direkt geçiş
  if (pathname === '/admin/login' || pathname === '/dealer/login') {
    return NextResponse.next()
  }

  // Eğer pathname'de locale yoksa ve root değilse, default locale ekle
  if (!pathnameHasLocale && pathname !== '/') {
    const locale = defaultLocale
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }

  // Root path için redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internal files - all of them)
     * - static (static files)
     * - favicon.ico (favicon file)
     * - static files (images, fonts, css, js)
     */
    '/((?!api|_next|static|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}
