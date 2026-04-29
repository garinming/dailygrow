'use client';

import { useRef, useState } from 'react';
import { Flame, Dumbbell, Sparkles, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DietEntry, ExerciseRoutine, SkincareRoutine } from '@/types';

interface Props {
  today: string;
  dayOfWeek: string;
  diets: DietEntry[];
  exercises: ExerciseRoutine[];
  skincares: SkincareRoutine[];
  onToggleComplete: (id: string, completedDates: string[]) => void;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: '아침', lunch: '점심', dinner: '저녁', snack: '간식',
};

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\s/?#]+)/);
  return m ? m[1] : null;
}

function ExerciseCarousel({ exercises, today, onToggleComplete }: {
  exercises: ExerciseRoutine[];
  today: string;
  onToggleComplete: (id: string, completedDates: string[]) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const scrollTo = (i: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: 'smooth' });
    setIdx(i);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const i = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setIdx(i);
  };

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {exercises.map(ex => {
          const done = ex.completedDates.includes(today);
          const videoId = ex.youtubeUrl ? getYoutubeId(ex.youtubeUrl) : null;
          return (
            <div key={ex.id} className="snap-start flex-shrink-0 w-full">
              {videoId && (
                <div className="rounded-xl overflow-hidden mb-3 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${done ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <button onClick={() => onToggleComplete(ex.id, ex.completedDates)} className="flex-shrink-0">
                  {done
                    ? <CheckCircle2 className="text-blue-500" size={22} />
                    : <Circle className="text-gray-300" size={22} />}
                </button>
                <span className={`flex-1 text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {ex.title}
                </span>
                {exercises.length > 1 && (
                  <span className="text-xs text-gray-400">{idx + 1}/{exercises.length}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {exercises.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => scrollTo(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="p-1 rounded-full text-gray-400 hover:text-blue-500 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {exercises.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-blue-500' : 'bg-gray-200'}`}
            />
          ))}
          <button
            onClick={() => scrollTo(Math.min(exercises.length - 1, idx + 1))}
            disabled={idx === exercises.length - 1}
            className="p-1 rounded-full text-gray-400 hover:text-blue-500 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function TodayView({ today, dayOfWeek, diets, exercises, skincares, onToggleComplete }: Props) {
  const totalCalories = diets.reduce((s, d) => s + d.calories, 0);
  const goal = 2000;
  const pct = Math.min((totalCalories / goal) * 100, 100);

  const morning = skincares.filter(s => s.session === 'morning');
  const evening = skincares.filter(s => s.session === 'evening');

  return (
    <div className="space-y-4">
      {/* 날짜 */}
      <p className="text-center text-sm text-gray-500 pt-1">
        {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} {dayOfWeek}요일
      </p>

      {/* 칼로리 카드 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-orange-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-orange-100 rounded-lg">
            <Flame className="text-orange-500" size={18} />
          </div>
          <span className="font-semibold text-gray-800">오늘의 칼로리</span>
        </div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-2xl font-bold text-orange-500">{totalCalories.toLocaleString()}</span>
          <span className="text-sm text-gray-400">/ {goal.toLocaleString()} kcal</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : 'bg-orange-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {diets.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-1">식단 탭에서 오늘 먹은 걸 기록해봐요 🍽️</p>
        ) : (
          <div className="space-y-1.5">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(key => {
              const items = diets.filter(d => d.type === key);
              if (!items.length) return null;
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-8 text-xs">{MEAL_LABELS[key]}</span>
                  <span className="flex-1 text-gray-700 truncate">{items.map(i => i.foodName).join(', ')}</span>
                  <span className="text-orange-400 font-medium text-xs">{items.reduce((s, i) => s + i.calories, 0)}kcal</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 운동 카드 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Dumbbell className="text-blue-500" size={18} />
          </div>
          <span className="font-semibold text-gray-800">오늘의 운동</span>
          <span className="ml-auto text-xs text-gray-400">{dayOfWeek}요일</span>
        </div>
        {exercises.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">
            오늘({dayOfWeek}) 운동 루틴이 없어요 💪
            <br /><span className="text-xs">루틴 탭에서 추가해보세요</span>
          </p>
        ) : (
          <ExerciseCarousel exercises={exercises} today={today} onToggleComplete={onToggleComplete} />
        )}
      </div>

      {/* 스킨케어 카드 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-purple-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Sparkles className="text-purple-500" size={18} />
          </div>
          <span className="font-semibold text-gray-800">오늘의 스킨케어</span>
          <span className="ml-auto text-xs text-gray-400">{dayOfWeek}요일</span>
        </div>
        {morning.length === 0 && evening.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">
            오늘({dayOfWeek}) 스킨케어 루틴이 없어요 ✨
            <br /><span className="text-xs">루틴 탭에서 추가해보세요</span>
          </p>
        ) : (
          <div className="space-y-3">
            {[{ label: '☀️ 아침', items: morning }, { label: '🌙 저녁', items: evening }].map(({ label, items }) => {
              if (!items.length) return null;
              return (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
                  <div className="space-y-1.5">
                    {items.map(item => {
                      const done = item.completedDates.includes(today);
                      return (
                        <div key={item.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${done ? 'bg-purple-50' : 'bg-gray-50'}`}>
                          <button onClick={() => onToggleComplete(item.id, item.completedDates)} className="flex-shrink-0">
                            {done
                              ? <CheckCircle2 className="text-purple-500" size={20} />
                              : <Circle className="text-gray-300" size={20} />}
                          </button>
                          <span className={`text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
