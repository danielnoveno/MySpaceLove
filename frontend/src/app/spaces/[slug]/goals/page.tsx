'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSpaces, useSpaceGoals } from '@/lib/hooks'
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

  // Edit modal state
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
    if (!confirm('Delete this goal?')) return
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-pink-500" />
            Goals
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {completedCount}/{goals.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600 transition"
        >
          <Plus className="h-4 w-4" />
          New Goal
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white/70 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
              placeholder="e.g. Plan a trip together"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
              placeholder="What does achieving this goal look like?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Points</label>
            <input
              type="number"
              min={1}
              required
              value={targetPoints}
              onChange={(e) => setTargetPoints(Number(e.target.value))}
              className="w-32 rounded-xl border border-rose-100 bg-white/70 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-50 transition"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Goal
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading goals...
        </div>
      )}

      {/* Goals List */}
      {!loading && goals.length === 0 && (
        <div className="text-center py-16">
          <Target className="h-12 w-12 text-pink-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No goals yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first goal to start tracking progress together</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal) => {
          const progress = goal.target_points > 0
            ? Math.min((goal.current_points / goal.target_points) * 100, 100)
            : 0
          const isComplete = !!goal.completed_at

          return (
            <div
              key={goal.id}
              className={`bg-white/80 backdrop-blur rounded-2xl shadow-sm border p-5 transition hover:shadow-md ${
                isComplete ? 'border-green-200 bg-green-50/50' : 'border-white/70'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-gray-900 ${isComplete ? 'line-through text-gray-500' : ''}`}>
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{goal.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => openEdit(goal)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    title="Edit goal"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{goal.current_points}/{goal.target_points} pts</span>
                  {isComplete && (
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Done
                    </span>
                  )}
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete ? 'bg-green-400' : 'bg-pink-400'
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
                    className="inline-flex items-center gap-1 rounded-lg bg-pink-100 text-pink-700 px-3 py-1.5 text-xs font-semibold hover:bg-pink-200 transition"
                  >
                    +1
                  </button>
                  {goal.current_points >= goal.target_points && (
                    <button
                      onClick={() => handleMarkComplete(goal.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-100 text-green-700 px-3 py-1.5 text-xs font-semibold hover:bg-green-200 transition"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mark Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingGoal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={handleUpdate}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-bold text-gray-900">Edit Goal</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Points</label>
              <input
                type="number"
                min={1}
                required
                value={editTargetPoints}
                onChange={(e) => setEditTargetPoints(Number(e.target.value))}
                className="w-32 rounded-xl border border-rose-100 bg-white/70 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-50 transition"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingGoal(null)}
                className="rounded-full px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
