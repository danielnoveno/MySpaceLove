'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useSpaces, useSpaceGoals } from '@/lib/hooks'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import { Target, Plus, Trash2, CheckCircle, Loader2, Pencil } from 'lucide-react'

export default function GoalsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { spaces } = useSpaces()
  const { goals, loading, error, fetchGoals, createGoal, updateGoal, completeGoal, deleteGoal } = useSpaceGoals()

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetPoints, setTargetPoints] = useState(10)
  const [creating, setCreating] = useState(false)

  const [editingGoal, setEditingGoal] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTargetPoints, setEditTargetPoints] = useState(10)
  const [saving, setSaving] = useState(false)

  const space = spaces.find(s => s.slug === slug)

  useEffect(() => {
    if (space) fetchGoals(space.id)
  }, [space, fetchGoals])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!space) return
    setCreating(true)
    const result = await createGoal({
      space_id: space.id,
      title,
      description: description || undefined,
      target_points: targetPoints,
    })
    if (!result.error) {
      setTitle('')
      setDescription('')
      setTargetPoints(10)
      setShowForm(false)
    }
    setCreating(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus goal ini?')) return
    await deleteGoal(id)
  }

  const openEdit = (goal: typeof goals[0]) => {
    setEditingGoal(goal.id)
    setEditTitle(goal.title)
    setEditDescription(goal.description || '')
    setEditTargetPoints(goal.target_points)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGoal === null) return
    setSaving(true)
    await updateGoal(editingGoal, {
      title: editTitle,
      description: editDescription || undefined,
      target_points: editTargetPoints,
    })
    setEditingGoal(null)
    setSaving(false)
  }

  const handleIncrement = async (goalId: number) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal || goal.completed_at) return
    const newPoints = goal.current_points + 1
    await updateGoal(goalId, { current_points: newPoints })
    if (newPoints >= goal.target_points) {
      await completeGoal(goalId)
    }
  }

  const handleMarkComplete = async (goalId: number) => {
    await completeGoal(goalId)
  }

  const completedCount = goals.filter(g => g.completed_at).length

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                <Target className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900">Goals</h1>
                <p className="text-warm-500">
                  {completedCount}/{goals.length} selesai
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Goal Baru
            </button>
          </div>
        </FadeIn>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Create Form */}
        {showForm && (
          <FadeIn delay={0.1}>
            <form onSubmit={handleCreate} className="rounded-3xl bg-white border border-warm-100 p-6 space-y-4 shadow-xl shadow-warm-900/5">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Judul</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 shadow-sm focus:border-brand-400 focus:ring-brand-400 focus:bg-white transition-all"
                  placeholder="Contoh: Rencana liburan bersama"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 shadow-sm focus:border-brand-400 focus:ring-brand-400 focus:bg-white transition-all"
                  placeholder="Seperti apa pencapaian goal ini?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Target Poin</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={targetPoints}
                  onChange={(e) => setTargetPoints(Number(e.target.value))}
                  className="w-32 rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 shadow-sm focus:border-brand-400 focus:ring-brand-400 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Buat Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full px-6 py-2.5 text-sm font-medium text-warm-600 hover:bg-warm-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </FadeIn>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-700">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-warm-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Memuat goals...
          </div>
        )}

        {/* Goals List */}
        {!loading && goals.length === 0 && (
          <FadeIn delay={0.1}>
            <div className="text-center py-16">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-400 mb-6">
                <Target className="h-12 w-12" />
              </div>
              <p className="text-warm-900 text-xl font-semibold mb-2">Belum ada goals</p>
              <p className="text-warm-500 text-sm mt-1">Buat goal pertama untuk mulai melacak kemajuan bersama</p>
            </div>
          </FadeIn>
        )}

        <StaggerContainer className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const progress = goal.target_points > 0
              ? Math.min((goal.current_points / goal.target_points) * 100, 100)
              : 0
            const isComplete = !!goal.completed_at

            return (
              <StaggerItem key={goal.id}>
                <div className={`rounded-3xl border p-5 transition-all hover:shadow-xl hover:shadow-warm-900/5 ${
                  isComplete
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-warm-100'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-warm-900 ${isComplete ? 'line-through text-warm-500' : ''}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-warm-500 mt-1 line-clamp-2">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => openEdit(goal)}
                        className="p-1.5 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit goal"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1.5 text-warm-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
                      <span>{goal.current_points}/{goal.target_points} pts</span>
                      {isComplete && (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Selesai
                        </span>
                      )}
                    </div>
                    <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isComplete ? 'bg-green-400' : 'bg-brand-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isComplete && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleIncrement(goal.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-brand-50 text-brand-700 px-3 py-1.5 text-xs font-semibold hover:bg-brand-100 transition-colors"
                      >
                        +1
                      </button>
                      {goal.current_points >= goal.target_points && (
                        <button
                          onClick={() => handleMarkComplete(goal.id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-green-100 text-green-700 px-3 py-1.5 text-xs font-semibold hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Tandai Selesai
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* Edit Modal */}
        {editingGoal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <form
              onSubmit={handleUpdate}
              className="bg-white rounded-3xl shadow-2xl border border-warm-100 p-6 w-full max-w-md space-y-4"
            >
              <h3 className="text-lg font-bold text-warm-900">Edit Goal</h3>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Judul</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 shadow-sm focus:border-brand-400 focus:ring-brand-400 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 shadow-sm focus:border-brand-400 focus:ring-brand-400 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Target Poin</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editTargetPoints}
                  onChange={(e) => setEditTargetPoints(Number(e.target.value))}
                  className="w-32 rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 shadow-sm focus:border-brand-400 focus:ring-brand-400 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="rounded-full px-6 py-2.5 text-sm font-medium text-warm-600 hover:bg-warm-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
