'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type SpaceGoal = {
  id: number
  space_id: number
  title: string
  description: string | null
  target_points: number
  current_points: number
  is_active: boolean
  completed_at: string | null
  created_at: string
}

export function useSpaceGoals() {
  const [goals, setGoals] = useState<SpaceGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchGoals = useCallback(async (spaceId: number) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('space_goals')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setGoals(data || [])
    setLoading(false)
  }, [supabase])

  const createGoal = useCallback(async (data: { space_id: number; title: string; description?: string; target_points: number }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: goal, error } = await supabase
      .from('space_goals')
      .insert({ space_id: data.space_id, title: data.title, description: data.description || null, target_points: data.target_points })
      .select().single()
    if (error) return { error: error.message }
    setGoals(prev => [goal, ...prev])
    return { goal }
  }, [supabase])

  const updateGoal = useCallback(async (goalId: number, updates: { title?: string; description?: string; target_points?: number; current_points?: number }) => {
    const { error } = await supabase
      .from('space_goals')
      .update(updates)
      .eq('id', goalId)
    if (error) return { error: error.message }
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g))
    return {}
  }, [supabase])

  const completeGoal = useCallback(async (goalId: number) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return { error: 'Goal not found' }
    const { error } = await supabase
      .from('space_goals')
      .update({ current_points: goal.target_points, completed_at: new Date().toISOString() })
      .eq('id', goalId)
    if (error) return { error: error.message }
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current_points: g.target_points, completed_at: new Date().toISOString() } : g))
    return {}
  }, [goals, supabase])

  const deleteGoal = useCallback(async (goalId: number) => {
    const { error } = await supabase.from('space_goals').delete().eq('id', goalId)
    if (error) return { error: error.message }
    setGoals(prev => prev.filter(g => g.id !== goalId))
    return {}
  }, [supabase])

  return { goals, loading, error, fetchGoals, createGoal, updateGoal, completeGoal, deleteGoal }
}
