'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

const toastContext: ToastContextType = {
  showToast: () => {},
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { id, message, type, duration }

    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, duration)
  }

  useEffect(() => {
    toastContext.showToast = showToast
  }, [])

  return { toasts, showToast }
}

export function showToast(message: string, type: ToastType = 'success', duration = 4000) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-toast', {
      detail: { message, type, duration },
    })
    window.dispatchEvent(event)
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setIsMounted(true)
    setContainer(document.body)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const handleShowToast = (e: CustomEvent) => {
      const { message, type, duration } = e.detail
      const id = Math.random().toString(36).substring(7)
      const newToast: Toast = { id, message, type, duration }

      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, duration)
    }

    window.addEventListener('show-toast', handleShowToast as EventListener)

    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener)
    }
  }, [isMounted])

  if (!isMounted || !container || typeof window === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    container
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const typeStyles = {
    success: 'bg-green-500 border-green-600 shadow-green-500/50',
    error: 'bg-red-500 border-red-600 shadow-red-500/50',
    warning: 'bg-yellow-500 border-yellow-600 shadow-yellow-500/50',
    info: 'bg-blue-500 border-blue-600 shadow-blue-500/50',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div
      className={`
        pointer-events-auto
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${typeStyles[toast.type]}
        border-2 rounded-xl px-6 py-4 min-w-[300px] max-w-[500px]
        shadow-2xl backdrop-blur-sm
        relative overflow-hidden
        animate-in slide-in-from-right
      `}
      style={{
        transform: isVisible
          ? 'translateX(0) perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1) translateZ(20px)'
          : 'translateX(100%) perspective(1000px) rotateY(-15deg) rotateX(5deg) scale(0.9) translateZ(0px)',
        transformStyle: 'preserve-3d',
        boxShadow: isVisible 
          ? `0 20px 60px -15px rgba(0, 0, 0, 0.3), 
             0 0 30px ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 
                        toast.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 
                        toast.type === 'warning' ? 'rgba(234, 179, 8, 0.4)' : 
                        'rgba(59, 130, 246, 0.4)'},
             inset 0 1px 0 rgba(255, 255, 255, 0.3)`
          : 'none',
      }}
    >
      {/* 3D Glow Effect - Enhanced */}
      <div
        className="absolute inset-0 opacity-30 blur-2xl"
        style={{
          background: `radial-gradient(circle at center, ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#eab308' : '#3b82f6'} 0%, transparent 70%)`,
          transform: 'translateZ(-10px)',
        }}
      />
      
      {/* 3D Top Highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 rounded-t-xl opacity-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent)',
          transform: 'translateZ(5px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4 text-white" style={{ transform: 'translateZ(10px)' }}>
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-xl font-bold shadow-2xl"
          style={{
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            transform: 'translateZ(15px)',
          }}
        >
          {icons[toast.type]}
        </div>
        <p className="flex-1 font-medium text-sm leading-relaxed drop-shadow-2xl" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          {toast.message}
        </p>
      </div>

      {/* Progress Bar - 3D */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30 overflow-hidden rounded-b-xl"
        style={{ transform: 'translateZ(5px)' }}
      >
        <div
          className="h-full bg-white/70 transition-all ease-linear shrink-bar"
          style={{
            animation: `shrink ${toast.duration}ms linear forwards`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

