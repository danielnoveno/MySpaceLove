'use client';

import React from 'react';
import { Heart, Frown, CloudRain, Sparkles, ThumbsUp } from 'lucide-react';

type Mood = 'happy' | 'sad' | 'miss' | 'excited' | 'grateful';

interface MoodSelectorProps { selectedMood: Mood | null; onMoodSelect: (mood: Mood) => void }

const moods: { id: Mood; label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }[] = [
  { id: 'happy', label: 'Happy', icon: <Heart size={24} />, color: 'text-brand-500', bgColor: 'bg-brand-50', borderColor: 'border-brand-400' },
  { id: 'sad', label: 'Sad', icon: <Frown size={24} />, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-400' },
  { id: 'miss', label: 'Miss You', icon: <CloudRain size={24} />, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-400' },
  { id: 'excited', label: 'Excited', icon: <Sparkles size={24} />, color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-400' },
  { id: 'grateful', label: 'Grateful', icon: <ThumbsUp size={24} />, color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-400' },
];

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {moods.map((mood) => {
        const isSelected = selectedMood === mood.id;
        return (
          <button key={mood.id} onClick={() => onMoodSelect(mood.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${isSelected ? `${mood.bgColor} ${mood.borderColor} ${mood.color} scale-105 shadow-md` : 'border-warm-100 hover:border-warm-200 text-warm-400 hover:text-warm-600 hover:bg-warm-50'}`}>
            <div className={`transition-colors ${isSelected ? mood.color : ''}`}>{mood.icon}</div>
            <span className="text-xs font-medium">{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}
