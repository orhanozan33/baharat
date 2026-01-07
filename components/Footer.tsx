'use client'

import Link from 'next/link'
import { getTranslations } from '@/lib/i18n'
import { useEffect, useState } from 'react'

import { type Locale } from '@/i18n'

interface FooterProps {
  locale: Locale
}

export function Footer({ locale }: FooterProps) {
  const t = getTranslations(locale)
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
  })
  const [contactInfo, setContactInfo] = useState({
    contactLocation: '',
    contactPhone: '',
    contactEmail: '',
    contactHours: '',
  })

  // Çalışma saatlerini locale'e göre çevir
  const translateContactHours = (hours: string): string => {
    if (!hours) return hours
    
    const dayTranslations: Record<string, Record<string, string>> = {
      tr: {
        'Pazartesi': 'Pazartesi',
        'Salı': 'Salı',
        'Çarşamba': 'Çarşamba',
        'Perşembe': 'Perşembe',
        'Cuma': 'Cuma',
        'Cumartesi': 'Cumartesi',
        'Pazar': 'Pazar',
      },
      en: {
        'Pazartesi': 'Monday',
        'Salı': 'Tuesday',
        'Çarşamba': 'Wednesday',
        'Perşembe': 'Thursday',
        'Cuma': 'Friday',
        'Cumartesi': 'Saturday',
        'Pazar': 'Sunday',
      },
      fr: {
        'Pazartesi': 'Lundi',
        'Salı': 'Mardi',
        'Çarşamba': 'Mercredi',
        'Perşembe': 'Jeudi',
        'Cuma': 'Vendredi',
        'Cumartesi': 'Samedi',
        'Pazar': 'Dimanche',
      }
    }
    
    let translated = hours
    const translations = dayTranslations[locale] || dayTranslations['tr']
    
    Object.keys(translations).forEach(trDay => {
      const regex = new RegExp(trDay, 'g')
      translated = translated.replace(regex, translations[trDay])
    })
    
    return translated
  }

  useEffect(() => {
    // Fetch social media links from API
    fetch('/api/settings/social')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSocialLinks({
            facebook: data.settings.facebook || '',
            instagram: data.settings.instagram || '',
          })
        }
      })
      .catch((error) => {
        console.error('Load social links error:', error)
      })

    // Fetch contact info from API
    fetch('/api/settings/contact')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setContactInfo({
            contactLocation: data.settings.contactLocation || '',
            contactPhone: data.settings.contactPhone || '',
            contactEmail: data.settings.contactEmail || '',
            contactHours: data.settings.contactHours || '',
          })
        }
      })
      .catch((error) => {
        console.error('Load contact info error:', error)
      })
  }, [])

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 pt-8 pb-0">
        <div className="grid grid-cols-1 gap-8">
          <div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              {/* İletişim Bilgileri - Sol Taraf */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">{t.footer.contactInfo}</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  {contactInfo.contactLocation && (
                    <li className="flex items-center gap-2">
                      <span>📍</span>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.contactLocation)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary-500 transition underline"
                      >
                        {contactInfo.contactLocation}
                      </a>
                    </li>
                  )}
                  {contactInfo.contactPhone && (
                    <li className="flex items-center gap-2">
                      <span>📞</span>
                      <a 
                        href={`tel:${contactInfo.contactPhone.replace(/\s+/g, '')}`}
                        className="text-gray-400 hover:text-primary-500 transition underline"
                      >
                        {contactInfo.contactPhone}
                      </a>
                    </li>
                  )}
                  {contactInfo.contactEmail && (
                    <li className="flex items-center gap-2">
                      <span>✉️</span>
                      <span>{contactInfo.contactEmail}</span>
                    </li>
                  )}
                </ul>
                {/* Çalışma saatleri - Sol */}
                {contactInfo.contactHours && (
                  <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                    <span>🕒</span>
                    <span>{translateContactHours(contactInfo.contactHours)}</span>
                  </div>
                )}
              </div>
              
              {/* Sosyal Medya İkonları - Sağ Taraf, İletişim başlığıyla aynı hizada (sadece desktop) */}
              <div className="hidden md:flex flex-col md:items-end">
                <h4 className="font-semibold mb-4 text-lg invisible">‎</h4>
                <div className="flex gap-4 items-center">
                  {socialLinks.facebook && (
                    <a 
                      href={socialLinks.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition text-white"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a 
                      href={socialLinks.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition text-white"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mobilde: Sosyal Medya İkonları - Copyright yazısının hemen üstünde */}
            <div className="flex justify-center mb-3 md:hidden">
              <div className="flex gap-4 items-center">
                {socialLinks.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition text-white"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition text-white"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
            
            {/* Copyright - Ortada, biraz sağa kaydırılmış, %210 yukarı (desktop), mobilde normal */}
            <div className="text-center mt-0 md:mt-4 text-gray-400 text-sm pl-0 md:pl-8 md:-translate-y-[210%]">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <span>&copy; {new Date().getFullYear()} Epice Buhara. {t.footer.allRights} <a href="https://www.findpoint.ca" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition underline">Findpoint</a></span>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Link href={`/${locale}/privacy`} className="text-gray-400 hover:text-primary-500 transition underline">
                    {t.footer.privacyLink}
                  </Link>
                  <span className="text-gray-500">|</span>
                  <Link href={`/${locale}/terms`} className="text-gray-400 hover:text-primary-500 transition underline">
                    {t.footer.termsLink}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
