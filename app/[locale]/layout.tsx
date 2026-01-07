import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ToastContainer } from '@/components/Toast'
import { getLocale, isValidLocale } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'

export const metadata: Metadata = {
  title: 'Epice Buhara - Modern E-Ticaret Platformu',
  description: 'Modern e-ticaret platformu',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer locale={locale} />
      <ToastContainer />
    </>
  )
}
