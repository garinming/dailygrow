'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Flame, Sparkles } from 'lucide-react';
import type { DietEntry } from '@/types';
import { searchFoods, type FoodItem } from '@/data/foods';

interface Props {
  diets: DietEntry[];
  onAdd: (data: Omit<DietEntry, 'id' | 'userId'>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

const MEAL_TYPES = [
  { key: 'breakfast' as const, label: '아침', emoji: '🌅' },
  { key: 'lunch' as const, label: '점심', emoji: '☀️' },
  { key: 'dinner' as const, label: '저녁', emoji: '🌙' },
  { key: 'snack' as const, label: '간식', emoji: '🍪' },
];

function getDateLabel(i: number, d: Date) {
  if (i === 0) return '오늘';
  if (i === 1) return '어제';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function DietView({ diets, onAdd, onDelete }: Props) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ foodName: '', calories: '', type: 'breakfast' as DietEntry['type'] });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dateDiets = diets.filter(d => d.date === selectedDate);
  const total = dateDiets.reduce((s, d) => s + d.calories, 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return { label: getDateLabel(i, d), value: d.toISOString().split('T')[0] };
  });

  const handleFoodNameChange = (value: string) => {
    setForm(f => ({ ...f, foodName: value }));
    setAutoFilled(false);
    setSuggestions(searchFoods(value));
  };

  const selectSuggestion = (food: FoodItem) => {
    setForm(f => ({ ...f, foodName: food.name, calories: String(food.calories) }));
    setSuggestions([]);
    setAutoFilled(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.foodName.trim() || !form.calories) return;
    setLoading(true);
    try {
      await onAdd({ date: selectedDate, foodName: form.foodName.trim(), calories: Number(form.calories), type: form.type });
      setForm({ foodName: '', calories: '', type: 'breakfast' });
      setSuggestions([]);
      setAutoFilled(false);
      setShowAdd(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">식단 기록</h2>
        <button
          onClick={() => { setShowAdd(!showAdd); setSuggestions([]); setAutoFilled(false); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <Plus size={15} /> 추가
        </button>
      </div>

      {/* 날짜 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {last7.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setSelectedDate(value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedDate === value ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 칼로리 요약 */}
      <div className="bg-white rounded-xl p-4 border border-orange-100 flex items-center gap-2">
        <Flame className="text-orange-400" size={18} />
        <span className="text-sm font-medium text-gray-700">{selectedDate === todayStr ? '오늘' : selectedDate} 합계</span>
        <span className="ml-auto text-xl font-bold text-orange-500">
          {total.toLocaleString()} <span className="text-sm font-normal text-gray-400">kcal</span>
        </span>
      </div>

      {/* 추가 폼 */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-orange-50 rounded-2xl p-4 border border-orange-200 space-y-3">
          <p className="font-semibold text-gray-800 text-sm">음식 추가</p>

          {/* 음식 이름 + 자동완성 */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="음식 이름 입력 (예: 닭가슴살, 비빔밥)"
              value={form.foodName}
              onChange={e => handleFoodNameChange(e.target.value)}
              required
              autoComplete="off"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white"
            />
            {/* 자동완성 드롭다운 */}
            {suggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-orange-200 shadow-lg overflow-hidden">
                {suggestions.map(food => (
                  <button
                    key={food.name}
                    type="button"
                    onMouseDown={() => selectSuggestion(food)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-orange-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-800">{food.name}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-gray-400">{food.unit}</span>
                      <span className="text-sm font-semibold text-orange-500">{food.calories}kcal</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 칼로리 필드 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="number"
                placeholder="칼로리 (kcal)"
                value={form.calories}
                onChange={e => { setForm(f => ({ ...f, calories: e.target.value })); setAutoFilled(false); }}
                required
                min="0"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none bg-white ${
                  autoFilled ? 'border-orange-300 bg-orange-50' : 'border-gray-200 focus:border-orange-400'
                }`}
              />
              {autoFilled && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Sparkles size={13} className="text-orange-400" />
                </span>
              )}
            </div>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as DietEntry['type'] }))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white"
            >
              {MEAL_TYPES.map(m => (
                <option key={m.key} value={m.key}>{m.emoji} {m.label}</option>
              ))}
            </select>
          </div>

          {autoFilled && (
            <p className="text-xs text-orange-400 flex items-center gap-1">
              <Sparkles size={11} /> 칼로리가 자동으로 입력됐어요. 수정도 가능해요.
            </p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex-1 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-600">
              취소
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
              {loading ? '추가 중...' : '추가'}
            </button>
          </div>
        </form>
      )}

      {/* 식단 리스트 */}
      {dateDiets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🍽️</p>
          <p className="text-sm">식단 기록이 없어요</p>
          <p className="text-xs mt-1">추가 버튼을 눌러 기록해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {MEAL_TYPES.map(({ key, label, emoji }) => {
            const items = dateDiets.filter(d => d.type === key);
            if (!items.length) return null;
            return (
              <div key={key} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2.5">
                  <span>{emoji}</span>
                  <span className="font-medium text-gray-700 text-sm">{label}</span>
                  <span className="ml-auto text-sm text-orange-400 font-medium">
                    {items.reduce((s, i) => s + i.calories, 0)}kcal
                  </span>
                </div>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm text-gray-700">{item.foodName}</span>
                      <span className="text-xs text-gray-400">{item.calories}kcal</span>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
