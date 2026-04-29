'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, Flame, Sparkles, Camera, Pencil, X } from 'lucide-react';
import type { DietEntry } from '@/types';
import { searchFoods, type FoodItem } from '@/data/foods';

interface Props {
  diets: DietEntry[];
  onAdd: (data: Omit<DietEntry, 'id' | 'userId'>) => void;
  onUpdate: (id: string, data: Partial<Omit<DietEntry, 'id' | 'userId'>>) => void;
  onDelete: (id: string) => void;
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

function compressImage(file: File, maxPx = 600): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = url;
  });
}

const emptyForm = { foodName: '', calories: '', type: 'breakfast' as DietEntry['type'], photoData: '' };

export default function DietView({ diets, onAdd, onUpdate, onDelete }: Props) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    if (isEdit) setEditForm(f => ({ ...f, photoData: compressed }));
    else setForm(f => ({ ...f, photoData: compressed }));
    e.target.value = '';
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.foodName.trim() || !form.calories) return;
    onAdd({
      date: selectedDate,
      foodName: form.foodName.trim(),
      calories: Number(form.calories),
      type: form.type,
      photoUrl: form.photoData || undefined,
    });
    setForm(emptyForm);
    setSuggestions([]);
    setAutoFilled(false);
    setShowAdd(false);
  };

  const startEdit = (item: DietEntry) => {
    setEditingId(item.id);
    setEditForm({
      foodName: item.foodName,
      calories: String(item.calories),
      type: item.type,
      photoData: item.photoUrl || '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.foodName.trim() || !editForm.calories) return;
    onUpdate(editingId, {
      foodName: editForm.foodName.trim(),
      calories: Number(editForm.calories),
      type: editForm.type,
      photoUrl: editForm.photoData || undefined,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">식단 기록</h2>
        <button
          onClick={() => { setShowAdd(!showAdd); setSuggestions([]); setAutoFilled(false); setForm(emptyForm); }}
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

          {/* 음식 이름 + 카메라 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder="음식 이름 (예: 닭가슴살, 비빔밥)"
                value={form.foodName}
                onChange={e => handleFoodNameChange(e.target.value)}
                required
                autoComplete="off"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white"
              />
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
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-orange-400 transition-colors"
            >
              <Camera size={18} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => handlePhotoSelect(e, false)} />
          </div>

          {/* 사진 미리보기 */}
          {form.photoData && (
            <div className="relative w-20 h-20">
              <img src={form.photoData} className="w-20 h-20 rounded-xl object-cover border border-orange-200" alt="food" />
              <button type="button" onClick={() => setForm(f => ({ ...f, photoData: '' }))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none">
                ×
              </button>
            </div>
          )}

          {/* 칼로리 + 식사 타입 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="number"
                placeholder="칼로리 (kcal)"
                value={form.calories}
                onChange={e => { setForm(f => ({ ...f, calories: e.target.value })); setAutoFilled(false); }}
                required min="0"
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
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DietEntry['type'] }))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white">
              {MEAL_TYPES.map(m => <option key={m.key} value={m.key}>{m.emoji} {m.label}</option>)}
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
            <button type="submit"
              className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium">
              추가
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
                <div className="space-y-2">
                  {items.map(item => (
                    editingId === item.id ? (
                      /* 인라인 수정 폼 */
                      <div key={item.id} className="bg-orange-50 rounded-xl p-3 border border-orange-200 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editForm.foodName}
                            onChange={e => setEditForm(f => ({ ...f, foodName: e.target.value }))}
                            className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-400"
                          />
                          <button type="button" onClick={() => editFileRef.current?.click()}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-orange-400 flex-shrink-0">
                            <Camera size={15} />
                          </button>
                          <input ref={editFileRef} type="file" accept="image/*" capture="environment" className="hidden"
                            onChange={e => handlePhotoSelect(e, true)} />
                        </div>
                        {editForm.photoData && (
                          <div className="relative w-16 h-16">
                            <img src={editForm.photoData} className="w-16 h-16 rounded-lg object-cover" alt="food" />
                            <button type="button" onClick={() => setEditForm(f => ({ ...f, photoData: '' }))}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                              ×
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editForm.calories}
                            onChange={e => setEditForm(f => ({ ...f, calories: e.target.value }))}
                            min="0"
                            className="w-24 px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-400"
                          />
                          <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value as DietEntry['type'] }))}
                            className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
                            {MEAL_TYPES.map(m => <option key={m.key} value={m.key}>{m.emoji} {m.label}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)}
                            className="flex-1 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-600 flex items-center justify-center gap-1">
                            <X size={13} /> 취소
                          </button>
                          <button onClick={handleSaveEdit}
                            className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 일반 아이템 */
                      <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        {item.photoUrl && (
                          <img src={item.photoUrl} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100" alt="food" />
                        )}
                        <span className="flex-1 text-sm text-gray-700">{item.foodName}</span>
                        <span className="text-xs text-gray-400">{item.calories}kcal</span>
                        <button onClick={() => startEdit(item)}
                          className="text-gray-300 hover:text-orange-400 transition-colors ml-1">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onDelete(item.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
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
