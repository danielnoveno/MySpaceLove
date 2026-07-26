'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ApplicationLogo from '@/components/ApplicationLogo'
import { useAuth } from '@/contexts/AuthContext'
import { FadeIn, MagneticButton } from '@/components/motion'
import {
  Bell, LogOut, User, Home, Clock, MessageCircle, Image, Music, Gamepad2, Settings,
  BookOpen, Timer, CalendarHeart, StickyNote, Star, FileText, BookImage, MapPin, Tv, Video, Menu,
  X, ChevronDown, Heart
} from 'lucide-react'

type AuthenticatedLayoutProps = {
  children: ReactNode
  header?: ReactNode
}

export default function AuthenticatedLayout({ children, header }: AuthenticatedLayoutProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count')
        if (res.ok) {
          const data = await res.json()
          setNotificationCount(data.count ?? 0)
        }
      } catch {
        // silently fail
      }
    }
    fetchNotifications()
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  // Extract space slug from pathname
  const spaceMatch = pathname.match(/\/spaces\/([^/]+)/)
  const spaceSlug = spaceMatch ? spaceMatch[1] : null

  const navItems = spaceSlug ? [
    { label: 'Dashboard', href: `/spaces/${spaceSlug}`, icon: Home },
    { label: 'Timeline', href: `/spaces/${spaceSlug}/timeline`, icon: Clock },
    { label: 'Gallery', href: `/spaces/${spaceSlug}/gallery`, icon: Image },
    { label: 'Messages', href: `/spaces/${spaceSlug}/messages`, icon: MessageCircle },
    { label: 'Music', href: `/spaces/${spaceSlug}/spotify`, icon: Music },
    { label: 'Journals', href: `/spaces/${spaceSlug}/journals`, icon: BookOpen },
    { label: 'Storybook', href: `/spaces/${spaceSlug}/storybook`, icon: BookOpen },
    { label: 'Countdowns', href: `/spaces/${spaceSlug}/countdowns`, icon: Timer },
    { label: 'Daily Notes', href: `/spaces/${spaceSlug}/daily`, icon: CalendarHeart },
    { label: 'Surprise Notes', href: `/spaces/${spaceSlug}/surprise-notes`, icon: StickyNote },
    { label: 'Wishlist', href: `/spaces/${spaceSlug}/wishlist`, icon: Star },
    { label: 'Documents', href: `/spaces/${spaceSlug}/docs`, icon: FileText },
    { label: 'Memory Lane', href: `/spaces/${spaceSlug}/memory-lane`, icon: BookImage },
    { label: 'Locations', href: `/spaces/${spaceSlug}/locations`, icon: MapPin },
    { label: 'Games', href: `/spaces/${spaceSlug}/games`, icon: Gamepad2 },
    { label: 'Nobar', href: `/spaces/${spaceSlug}/nobar`, icon: Tv },
    { label: 'Room', href: `/spaces/${spaceSlug}/room`, icon: Video },
  ] : [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
  ]

  return (
    <div className="min-h-screen bg-brand-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-white border-r border-warm-100 transition-all duration-300 ${
          desktopSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-warm-100">
          <Link href="/" className="flex items-center gap-3">
            <ApplicationLogo className="h-8 w-8 text-brand-500 shrink-0" />
            {desktopSidebarOpen && (
              <span className="font-bold text-warm-800">MySpaceLove</span>
            )}
          </Link>
          <button
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            className="p-2 text-warm-400 hover:text-warm-600 hover:bg-warm-50 rounded-xl transition-colors"
            aria-label={desktopSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${desktopSidebarOpen ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-warm-600 hover:bg-warm-50 hover:text-warm-800'
                }`}
                title={!desktopSidebarOpen ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? 'text-brand-500' : 'text-warm-400 group-hover:text-warm-600'
                }`} />
                {desktopSidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-warm-100 p-3">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-600 hover:bg-warm-50 hover:text-warm-800 transition-colors"
              aria-label="Menu pengguna"
              aria-expanded={userMenuOpen}
            >
              <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-brand-600" />
              </div>
              {desktopSidebarOpen && (
                <>
                  <span className="flex-1 text-left truncate">{user?.email?.split('@')[0]}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-warm-100 py-1 z-50">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 hover:text-warm-900 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 hover:text-warm-900 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Pengaturan
                </Link>
                <hr className="my-1 border-warm-100" />
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-coral-600 hover:bg-coral-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        desktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-warm-100" role="banner">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile Logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <ApplicationLogo className="h-8 w-8 text-brand-500" />
              <span className="font-bold text-warm-800">MySpaceLove</span>
            </div>

            {/* Spacer for desktop */}
            <div className="hidden lg:block" />

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative p-2.5 text-warm-500 hover:text-warm-700 hover:bg-warm-50 rounded-xl transition-colors"
                aria-label={`Notifikasi${notificationCount > 0 ? `, ${notificationCount} belum dibaca` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-warm-500 hover:text-warm-700 hover:bg-warm-50 rounded-xl transition-colors"
                aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div id="mobile-nav" className="lg:hidden border-t border-warm-100 bg-white/95 backdrop-blur">
              <div className="px-4 pt-4 pb-6 space-y-1 max-h-[70vh] overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-warm-600 hover:bg-warm-50 hover:text-warm-800'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-brand-500' : 'text-warm-400'}`} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </header>

        {/* Header Slot */}
        {header && (
          <div className="bg-white border-b border-warm-100">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {header}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] pb-24 lg:pb-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-warm-100 bg-white/80 py-4 text-center text-sm text-warm-500">
          <span className="font-medium text-brand-500">MySpaceLove</span> ©{' '}
          {new Date().getFullYear()} • Dibuat dengan{' '}
          <Heart className="inline h-3.5 w-3.5 text-coral-500 fill-coral-500" />
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      {spaceSlug && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-warm-100 safe-area-inset-bottom" aria-label="Bottom navigation">
          <div className="flex items-center justify-around h-16 px-2">
            <Link href={`/spaces/${spaceSlug}`} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${pathname === `/spaces/${spaceSlug}` ? 'text-brand-600' : 'text-warm-500'}`}>
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link href={`/spaces/${spaceSlug}/timeline`} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${pathname.startsWith(`/spaces/${spaceSlug}/timeline`) ? 'text-brand-600' : 'text-warm-500'}`}>
              <Clock className="h-5 w-5" />
              <span className="text-[10px] font-medium">Timeline</span>
            </Link>
            <Link href={`/spaces/${spaceSlug}/messages`} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${pathname.startsWith(`/spaces/${spaceSlug}/messages`) ? 'text-brand-600' : 'text-warm-500'}`}>
              <MessageCircle className="h-5 w-5" />
              <span className="text-[10px] font-medium">Chat</span>
            </Link>
            <Link href={`/spaces/${spaceSlug}/spotify`} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${pathname.startsWith(`/spaces/${spaceSlug}/spotify`) ? 'text-brand-600' : 'text-warm-500'}`}>
              <Music className="h-5 w-5" />
              <span className="text-[10px] font-medium">Music</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex flex-col items-center gap-1 px-3 py-2 text-warm-500">
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
