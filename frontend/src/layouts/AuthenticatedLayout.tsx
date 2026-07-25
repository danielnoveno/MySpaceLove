'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ApplicationLogo from '@/components/ApplicationLogo'
import { useAuth } from '@/contexts/AuthContext'
import {
  Bell, LogOut, User, Home, Clock, MessageCircle, Image, Music, Gamepad2, Settings,
  BookOpen, Timer, CalendarHeart, StickyNote, Star, FileText, BookImage, MapPin, Tv, Video, Menu,
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
  const [notificationCount, setNotificationCount] = useState(0)

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Navigation */}
      <nav aria-label="Main navigation" className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <ApplicationLogo className="h-8 w-8 fill-current text-pink-500" />
                <span className="font-bold text-pink-600 hidden sm:block">MySpaceLove</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Right side - Profile & Notifications */}
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Link>

              <div className="relative group">
                <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors" aria-label="User menu" aria-haspopup="true">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block text-sm font-medium">{user?.email?.split('@')[0]}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div id="mobile-nav" className="md:hidden border-t border-pink-100 bg-white/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Header */}
      {header && (
        <header role="banner" className="bg-white/60 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {header}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-12rem)] pb-20 md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-100 bg-white/80 backdrop-blur py-4 text-center text-sm text-gray-600">
        <span className="font-medium text-pink-500">MySpaceLove</span> ©{' '}
        {new Date().getFullYear()} • Made with ❤️
      </footer>

      {/* Mobile Bottom Navigation */}
      {spaceSlug && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-pink-100 safe-area-inset-bottom">
          <div className="flex items-center justify-around h-16">
            <Link href={`/spaces/${spaceSlug}`} className={`flex flex-col items-center gap-1 px-3 py-2 ${pathname === `/spaces/${spaceSlug}` ? 'text-pink-600' : 'text-gray-500'}`}>
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link href={`/spaces/${spaceSlug}/timeline`} className={`flex flex-col items-center gap-1 px-3 py-2 ${pathname.startsWith(`/spaces/${spaceSlug}/timeline`) ? 'text-pink-600' : 'text-gray-500'}`}>
              <Clock className="h-5 w-5" />
              <span className="text-xs font-medium">Timeline</span>
            </Link>
            <Link href={`/spaces/${spaceSlug}/messages`} className={`flex flex-col items-center gap-1 px-3 py-2 ${pathname.startsWith(`/spaces/${spaceSlug}/messages`) ? 'text-pink-600' : 'text-gray-500'}`}>
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Chat</span>
            </Link>
            <Link href={`/spaces/${spaceSlug}/spotify`} className={`flex flex-col items-center gap-1 px-3 py-2 ${pathname.startsWith(`/spaces/${spaceSlug}/spotify`) ? 'text-pink-600' : 'text-gray-500'}`}>
              <Music className="h-5 w-5" />
              <span className="text-xs font-medium">Music</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500">
              <Menu className="h-5 w-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
