'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ApplicationLogo from '@/components/ApplicationLogo'
import { FadeIn, StaggerContainer, StaggerItem, MagneticButton } from '@/components/motion'
import {
  Heart, ArrowRight, Sparkle, CalendarHeart, Image as ImageIcon, MessageCircle,
  Music, Gamepad2, Star, Clock, BookOpen, MapPin
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
          <p className="text-warm-500 text-sm">Memuat...</p>
        </div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-brand-50 overflow-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <ApplicationLogo className="h-8 w-8 text-brand-500" />
              <span className="font-bold text-lg text-warm-900">MySpaceLove</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-warm-600 hover:text-brand-600 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 rounded-full hover:bg-brand-600 transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                Mulai Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-[100dvh] flex items-center">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-brand-200/40 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-coral-200/30 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-100/20 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Teks */}
            <div>
              <FadeIn delay={0.1}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-600 text-sm font-semibold mb-6">
                  <Sparkle className="w-4 h-4" />
                  Ruang Privat untuk Pasangan
                </span>
              </FadeIn>

              <FadeIn delay={0.2}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-warm-900 leading-[1.1] mb-6">
                  Pelihara Cinta Anda,{' '}
                  <span className="text-brand-500">Bersama.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-lg text-warm-600 max-w-lg mb-10 leading-relaxed">
                  MySpaceLove membantu Anda membangun ruang indah tempat memori hidup,
                  kejutan terungkap, dan hubungan Anda semakin kuat setiap hari.
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <MagneticButton as="a" href="/auth/register" strength={0.2}>
                    <span className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-brand-500 rounded-full hover:bg-brand-600 transition-all hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]">
                      Mulai Perjalanan
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </MagneticButton>
                  <MagneticButton as="a" href="/auth/login" strength={0.15}>
                    <span className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-warm-700 bg-white rounded-full border border-warm-200 hover:border-brand-200 hover:text-brand-600 transition-all hover:shadow-lg active:scale-[0.98]">
                      Masuk
                    </span>
                  </MagneticButton>
                </div>
              </FadeIn>
            </div>

            {/* Right — Visual Grid (bukan fake screenshot) */}
            <FadeIn delay={0.3} direction="right">
              <div className="relative">
                {/* Main card */}
                <div className="relative rounded-3xl bg-gradient-to-br from-brand-400 via-brand-500 to-coral-500 p-1 shadow-2xl shadow-brand-500/20">
                  <div className="rounded-[22px] bg-white p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-brand-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-warm-900">Ruang Kami</p>
                        <p className="text-sm text-warm-500">Sejak 14 Feb 2024</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { icon: Clock, label: 'Timeline', color: 'bg-brand-50 text-brand-500' },
                        { icon: ImageIcon, label: 'Galeri', color: 'bg-purple-50 text-purple-500' },
                        { icon: MessageCircle, label: 'Pesan', color: 'bg-blue-50 text-blue-500' },
                        { icon: Music, label: 'Musik', color: 'bg-green-50 text-green-500' },
                        { icon: Star, label: 'Wishlist', color: 'bg-amber-50 text-amber-500' },
                        { icon: Gamepad2, label: 'Game', color: 'bg-orange-50 text-orange-500' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${item.color}`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-50">
                      <CalendarHeart className="w-5 h-5 text-brand-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-warm-800">Hari spesialmu 3 hari lagi!</p>
                        <p className="text-xs text-warm-500">Ulang tahun ke-2 bersama</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 rounded-2xl bg-white p-3 sm:p-4 shadow-xl shadow-warm-900/5 animate-[float_6s_ease-in-out_infinite]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center">
                      <span className="text-sm">💝</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-warm-800">Surprise!</p>
                      <p className="text-[10px] text-warm-500">Catatan rahasia baru</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 rounded-2xl bg-white p-3 sm:p-4 shadow-xl shadow-warm-900/5 animate-[float_6s_ease-in-out_infinite_1s]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-sm">🎵</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-warm-800">Now Playing</p>
                      <p className="text-[10px] text-warm-500">Ed Sheeran - Perfect</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== FITUR — Bento Grid ===== */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-brand-500 tracking-wide uppercase">Fitur Lengkap</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mt-3 mb-4">
                Semua yang Anda Butuhkan untuk Tetap Terhubung
              </h2>
              <p className="text-warm-600 text-lg">
                Dari memori hingga kejutan, semuanya ada di satu tempat.
              </p>
            </div>
          </FadeIn>

          {/* Bento Grid — asymmetric, tidak equal 3 kolom */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Large card — spans 2 cols on lg */}
            <StaggerItem className="lg:col-span-2 group">
              <div className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-brand-500 to-coral-500 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
                <div className="relative z-10">
                  <Clock className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">Timeline Cinta</h3>
                  <p className="text-white/80 max-w-md leading-relaxed">
                    Abadikan setiap momen spesial dalam perjalanan cinta Anda.
                    Tambahkan foto, catatan, dan tanggal penting.
                  </p>
                </div>
              </div>
            </StaggerItem>

            {/* Regular cards */}
            <StaggerItem className="group">
              <div className="h-full p-6 rounded-3xl bg-white border border-warm-100 hover:border-brand-200 transition-all hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-warm-900 mb-2">Galeri Foto</h3>
                <p className="text-warm-600 text-sm leading-relaxed">
                  Kumpulkan foto-foto indah Anda berdua dalam satu galeri pribadi.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="group">
              <div className="h-full p-6 rounded-3xl bg-white border border-warm-100 hover:border-brand-200 transition-all hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-warm-900 mb-2">Chat Langsung</h3>
                <p className="text-warm-600 text-sm leading-relaxed">
                  Kirim pesan, stiker, dan emoji satu sama lain kapan saja.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="group">
              <div className="h-full p-6 rounded-3xl bg-white border border-warm-100 hover:border-brand-200 transition-all hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Music className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-warm-900 mb-2">Berbagi Musik</h3>
                <p className="text-warm-600 text-sm leading-relaxed">
                  Dengarkan musik favorit Anda berdua dengan integrasi Spotify.
                </p>
              </div>
            </StaggerItem>

            {/* Another large card */}
            <StaggerItem className="lg:col-span-2 group">
              <div className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-coral-400 to-brand-500 text-white overflow-hidden">
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
                <div className="relative z-10">
                  <Gamepad2 className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">Main Bareng</h3>
                  <p className="text-white/80 max-w-md leading-relaxed">
                    Tetris, Snake, 2048, Memory Match, dan banyak lagi.
                    Saingan sehat untuk hubungan yang lebih menyenangkan!
                  </p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem className="group">
              <div className="h-full p-6 rounded-3xl bg-white border border-warm-100 hover:border-brand-200 transition-all hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-warm-900 mb-2">Wishlist Bersama</h3>
                <p className="text-warm-600 text-sm leading-relaxed">
                  Buat daftar keinginan bersama untuk hadiah dan aktivitas.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="group">
              <div className="h-full p-6 rounded-3xl bg-white border border-warm-100 hover:border-brand-200 transition-all hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-warm-900 mb-2">Jurnal Harian</h3>
                <p className="text-warm-600 text-sm leading-relaxed">
                  Tulis catatan harian tentang perasaan dan momen Anda.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="group">
              <div className="h-full p-6 rounded-3xl bg-white border border-warm-100 hover:border-brand-200 transition-all hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-coral-50 text-coral-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-warm-900 mb-2">Lokasi Bersama</h3>
                <p className="text-warm-600 text-sm leading-relaxed">
                  Tandai tempat-tempat berharga dalam perjalanan cinta Anda.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ===== TESTIMONIAL ===== */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-brand-500 tracking-wide uppercase">Kata Mereka</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mt-3">
                Dicintai oleh Ribuan Pasangan
              </h2>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "MySpaceLove membuat kami merasa lebih dekat meski berjauhan. Fitur timeline-nya luar biasa!",
                name: "Rina & Budi",
                role: "Long distance since 2023",
              },
              {
                quote: "Surprise notes-nya selalu bikin hari saya lebih cerah. Fitur terbaik untuk pasangan!",
                name: "Ani & Dedi",
                role: "Married 2 years",
              },
              {
                quote: "Game bareng jadi kegiatan favorit kami sekarang. Lucu dan menyenangkan!",
                name: "Maya & Raka",
                role: "Dating since 2024",
              },
            ].map((item) => (
              <StaggerItem key={item.name}>
                <div className="h-full p-6 rounded-3xl bg-brand-50 border border-brand-100">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-warm-700 leading-relaxed mb-6">&ldquo;{item.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-warm-900">{item.name}</p>
                    <p className="text-sm text-warm-500">{item.role}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="relative rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-600 to-coral-500 p-12 sm:p-16 text-center text-white overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Siap Memulai Perjalanan Cinta?
                </h2>
                <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                  Buat ruang berbagi Anda hari ini dan mulai membangun memori indah bersama.
                </p>
                <MagneticButton as="a" href="/auth/register" strength={0.2}>
                  <span className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-brand-600 bg-white rounded-full hover:bg-brand-50 transition-all hover:shadow-xl active:scale-[0.98]">
                    Buat Akun Gratis
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </MagneticButton>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-warm-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <ApplicationLogo className="h-7 w-7 text-brand-500" />
              <span className="font-bold text-warm-900">MySpaceLove</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-warm-500">
              <Link href="/auth/login" className="hover:text-brand-500 transition-colors">Masuk</Link>
              <Link href="/auth/register" className="hover:text-brand-500 transition-colors">Daftar</Link>
            </div>
            <p className="text-sm text-warm-400">
              Dibuat dengan <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500 inline" /> untuk pasangan
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
