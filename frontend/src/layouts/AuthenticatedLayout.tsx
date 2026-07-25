'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ApplicationLogo from '@/components/ApplicationLogo'
import { useAuth } from '@/contexts/AuthContext'
import { Bell, LogOut, User, Home, Clock, MessageCircle, Image, Music, Gamepad2, Settings } from 'lucide-react'

type AuthenticatedLayoutProps = {
  children: ReactNode
  header?: ReactNode
}

export default function AuthenticatedLayout({ children, header }: AuthenticatedLayoutProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Simulate navigation progress
    setIsNavigating(true)
    setLoadingProgress(30)
    
    const timer = setTimeout(() => {
      setLoadingProgress(100)
      setTimeout(() => {
        setIsNavigating(false)
        setLoadingProgress(0)
      }, 200)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

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
    { label: 'Games', href: `/spaces/${spaceSlug}/games`, icon: Gamepad2 },
  ] : [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Loading Progress Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100 shadow-sm">
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
              >
                <Bell className="h-5 w-5" />
                {/* Badge for unread notifications - TODO: fetch from Supabase */}
              </Link>

              <div className="relative group">
                <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors">
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
          <div className="md:hidden border-t border-pink-100 bg-white/95 backdrop-blur">
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
        <header className="bg-white/60 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {header}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-12rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-100 bg-white/80 backdrop-blur py-4 text-center text-sm text-gray-600">
        <span className="font-medium text-pink-500">MySpaceLove</span> ©{' '}
        {new Date().getFullYear()} • Made with ❤️
      </footer>
    </div>
  )
}
