'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import AppImage from '@/components/AppImage'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useTimeline, TimelineItem } from '@/lib/hooks/useTimeline'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import { Calendar, Edit, Heart, Images, Loader2, Plus, Trash2, X, Clock } from 'lucide-react'

type MediaOption = {
  path: string
  url: string
}

const buildMediaOptions = (item: TimelineItem, supabase: ReturnType<typeof createClient>): MediaOption[] => {
  const paths = item.media_paths ?? []
  return paths.map((path) => ({
    path,
    url: supabase.storage.from('public').getPublicUrl(path).data.publicUrl,
  }))
}

export default function TimelineIndexPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()
  const { timelines, loading, fetchTimelines, deleteTimeline, setThumbnail } = useTimeline()

  const [spaceTitle, setSpaceTitle] = useState('')
  const [spaceId, setSpaceId] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [thumbnailPending, setThumbnailPending] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<TimelineItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchSpace = useCallback(async () => {
    const { data, error } = await supabase
      .from('spaces')
      .select('id, title')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      router.push('/spaces')
      return
    }

    if (data) {
      setSpaceTitle(data.title)
      setSpaceId(data.id)
      fetchTimelines(data.id)
    }
  }, [fetchTimelines, router, slug, supabase])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user && slug) {
      const timeout = setTimeout(fetchSpace, 0)
      return () => clearTimeout(timeout)
    }
  }, [user, authLoading, slug, router, fetchSpace])

  const formatDate = useCallback((value?: string) => {
    if (!value) return ''
    try {
      return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return value
    }
  }, [])

  const handleThumbnailChange = useCallback(async (timelineUuid: string, path: string | null) => {
    setThumbnailPending(timelineUuid)
    const result = await setThumbnail(timelineUuid, path)
    if (result.error) {
      console.error('Gagal update thumbnail', result.error)
    }
    setThumbnailPending(null)
  }, [setThumbnail])

  const confirmDelete = useCallback((item: TimelineItem) => {
    setPendingDelete(item)
  }, [])

  const performDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)

    const result = await deleteTimeline(pendingDelete.uuid)
    if (!result.error) {
      setPendingDelete(null)
    }
    setDeleting(false)
  }, [pendingDelete, deleteTimeline])

  const itemsWithFallback = useMemo(() => {
    return timelines.map((item) => {
      const media = buildMediaOptions(item, supabase)
      const fallback = media[0]?.url ?? null
      return {
        ...item,
        media,
        coverUrl: item.thumbnail_path
          ? supabase.storage.from('public').getPublicUrl(item.thumbnail_path).data.publicUrl
          : fallback,
        coverPath: item.thumbnail_path ?? media[0]?.path ?? null,
      }
    })
  }, [timelines, supabase])

  if (authLoading || loading || !spaceId) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-brand-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
              <Clock className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-warm-900">Timeline</h1>
              <p className="text-warm-500">{spaceTitle}</p>
            </div>
          </div>
        </FadeIn>
      }
    >
      <div className="relative mx-auto max-w-6xl space-y-10 px-6 pb-16">
        {/* Header Section */}
        <FadeIn delay={0.1}>
          <section className="rounded-3xl border border-warm-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400 font-semibold">Galeri cerita</p>
                <h3 className="text-2xl font-semibold text-warm-900">Atur momen indah Anda</h3>
                <p className="text-sm text-warm-500">
                  Pilih foto yang paling mewakili setiap cerita sebagai sampul.
                </p>
              </div>
              <Link
                href={`/spaces/${slug}/timeline/create`}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Tambah Momen
              </Link>
            </div>
          </section>
        </FadeIn>

        {/* Empty State */}
        {itemsWithFallback.length === 0 ? (
          <FadeIn delay={0.2}>
            <div className="rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/50 py-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-400 mb-4">
                <Images className="h-10 w-10" />
              </div>
              <p className="text-lg font-semibold text-warm-900">Belum ada kenangan tersimpan.</p>
              <p className="mt-2 text-sm text-warm-500">
                Mulai tambahkan cerita pertama Anda hari ini.
              </p>
              <Link
                href={`/spaces/${slug}/timeline/create`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                <Plus className="h-5 w-5" />
                Tambah Momen Pertama
              </Link>
            </div>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {itemsWithFallback.map((item) => {
              const media = item.media as MediaOption[]

              return (
                <StaggerItem key={item.uuid}>
                  <article className="group relative overflow-hidden rounded-3xl border border-warm-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-warm-900/5">
                    <div className="relative grid gap-6 px-8 pb-10 pt-10">
                      {/* Cover Image */}
                      <div className="relative mx-auto w-full max-w-sm">
                        <div className="relative overflow-hidden rounded-2xl border border-warm-100 bg-white shadow-lg transition group-hover:shadow-2xl">
                          {item.coverUrl ? (
                            <AppImage
                              src={item.coverUrl}
                              alt={item.title}
                              className="h-64 w-full object-cover"
                              onClick={() => setSelectedItem(item)}
                            />
                          ) : (
                            <div className="flex h-64 w-full flex-col items-center justify-center gap-3 bg-brand-50 text-brand-400">
                              <Images className="h-10 w-10" />
                              <span className="text-sm font-medium">Belum ada foto</span>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent px-4 py-3 text-white">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                              <Calendar className="h-3 w-3 text-white/80" />
                              {formatDate(item.date)}
                            </div>
                            <h4 className="mt-1 text-lg font-semibold">{item.title}</h4>
                          </div>
                        </div>
                      </div>

                      {/* Description & Thumbnail Selector */}
                      <div className="rounded-2xl border border-warm-100 bg-warm-50 p-5">
                        <p className="line-clamp-3 text-sm text-warm-700">
                          {item.description ?? 'Belum ada cerita ditulis.'}
                        </p>

                        {media.length > 0 && (
                          <div className="mt-5 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-warm-400">
                              Pilih Foto Sampul
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {media.map((option) => {
                                const isActive = option.path === item.coverPath
                                const isDisabled = thumbnailPending === item.uuid
                                return (
                                  <button
                                    key={option.path}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => handleThumbnailChange(item.uuid, option.path)}
                                    className={`relative h-16 w-16 overflow-hidden rounded-xl border bg-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                                      isActive
                                        ? 'border-brand-500 ring-2 ring-brand-200'
                                        : 'border-warm-100 hover:-translate-y-1'
                                    } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                                    aria-label="Pilih thumbnail"
                                  >
                                    <AppImage
                                      src={option.url}
                                      alt="opsi thumbnail"
                                      className="h-full w-full object-cover"
                                    />
                                    {isActive && (
                                      <span className="absolute bottom-1 left-1 rounded-full bg-brand-500 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                                        aktif
                                      </span>
                                    )}
                                  </button>
                                )
                              })}
                              {media.length > 1 && item.coverPath && (
                                <button
                                  type="button"
                                  disabled={thumbnailPending === item.uuid}
                                  onClick={() => handleThumbnailChange(item.uuid, null)}
                                  className="inline-flex items-center justify-center rounded-xl border border-warm-200 bg-white px-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-500 transition hover:bg-brand-50 disabled:opacity-60"
                                >
                                  Reset
                                </button>
                              )}
                              {thumbnailPending === item.uuid && (
                                <div className="inline-flex items-center gap-2 rounded-xl border border-warm-200 bg-white px-3 py-2 text-xs font-medium text-brand-500">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Menyimpan...
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-warm-600">
                          <div className="flex flex-wrap items-center gap-3">
                            <Link
                              href={`/spaces/${slug}/timeline/${item.uuid}/edit`}
                              className="inline-flex items-center gap-2 rounded-full border border-warm-200 px-4 py-1.5 transition-all hover:bg-brand-500 hover:text-white hover:border-brand-500"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => confirmDelete(item)}
                              className="inline-flex items-center gap-2 rounded-full border border-warm-200 px-4 py-1.5 text-coral-500 transition-all hover:bg-coral-500 hover:text-white hover:border-coral-500"
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </button>
                          </div>
                          {media.length > 0 && (
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="inline-flex items-center gap-2 rounded-full border border-warm-200 px-4 py-1.5 transition-all hover:bg-brand-500 hover:text-white hover:border-brand-500"
                            >
                              <Heart className="h-4 w-4" />
                              Detail
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-warm-900/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 rounded-full bg-warm-100 p-2 text-warm-500 transition-colors hover:bg-warm-200 hover:text-warm-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-semibold text-warm-900">{selectedItem.title}</h3>
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.32em] text-brand-400 font-medium">
                  <Calendar className="h-4 w-4" />
                  {formatDate(selectedItem.date)}
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-warm-700">
                  {selectedItem.description ?? 'Belum ada cerita ditulis.'}
                </p>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {(selectedItem.media_paths || []).map((path, index) => {
                    const url = supabase.storage.from('public').getPublicUrl(path).data.publicUrl
                    return (
                      <button
                        key={`${selectedItem.uuid}-${index}`}
                        type="button"
                        onClick={() => setPreviewImage(url)}
                        className="overflow-hidden rounded-2xl border border-warm-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                      >
                        <AppImage
                          src={url}
                          alt={`media-${index}`}
                          className="h-32 w-full object-cover"
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-900/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <AppImage
            src={previewImage}
            alt="pratinjau"
            className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-warm-900/50 backdrop-blur-sm p-4"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-warm-900">
              Hapus &quot;{pendingDelete.title}&quot;?
            </h3>
            <p className="mt-2 text-sm text-warm-500">
              Momen ini akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => !deleting && setPendingDelete(null)}
                className="flex-1 rounded-xl border border-warm-200 px-4 py-2.5 text-sm font-medium text-warm-700 transition-colors hover:bg-warm-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={performDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-coral-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-coral-600 disabled:opacity-60"
              >
                {deleting ? 'Menghapus...' : 'Ya, hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
