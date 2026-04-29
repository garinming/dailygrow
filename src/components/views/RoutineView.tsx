'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import type { ExerciseRoutine, SkincareRoutine } from '@/types';

interface Props {
  exercises: ExerciseRoutine[];
  skincares: SkincareRoutine[];
  onAdd: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;

function DayPicker({ selected, onChange, color }: { selected: string[]; onChange: (days: string[]) => void; color: string }) {
  const toggle = (d: string) =>
    onChange(selected.includes(d) ? selected.filter(x => x !== d) : [...selected, d]);
  return (
    <div className="flex gap-1.5">
      {DAYS.map(d => (
        <button
          key={d}
          type="button"
          onClick={() => toggle(d)}
          className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
            selected.includes(d) ? `${color} text-white` : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

function ExerciseForm({
  initial, onSubmit, onCancel, color,
}: { initial?: Partial<ExerciseRoutine>; onSubmit: (d: any) => void; onCancel: () => void; color: string }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.youtubeUrl ?? '');
  const [days, setDays] = useState<string[]>(initial?.dayOfWeek ?? []);

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (!title.trim() || !days.length) return; onSubmit({ title: title.trim(), youtubeUrl: url.trim(), dayOfWeek: days }); }}
      className="bg-blue-50 rounded-2xl p-4 border border-blue-200 space-y-3"
    >
      <input
        value={title} onChange={e => setTitle(e.target.value)}
        placeholder="운동 이름 (예: 30분 홈트)"
        required
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
      />
      <input
        value={url} onChange={e => setUrl(e.target.value)}
        placeholder="유튜브 URL (선택 사항)"
        type="url"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
      />
      <div>
        <p className="text-xs text-gray-500 mb-2">요일 선택 <span className="text-red-400">*</span></p>
        <DayPicker selected={days} onChange={setDays} color="bg-blue-500" />
      </div>
      {days.length === 0 && <p className="text-xs text-red-400">요일을 하나 이상 선택해주세요</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-600">취소</button>
        <button type="submit" className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium">저장</button>
      </div>
    </form>
  );
}

function SkincareForm({
  initial, onSubmit, onCancel,
}: { initial?: Partial<SkincareRoutine>; onSubmit: (d: any) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [session, setSession] = useState<'morning' | 'evening'>(initial?.session ?? 'morning');
  const [days, setDays] = useState<string[]>(initial?.dayOfWeek ?? []);

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (!title.trim() || !days.length) return; onSubmit({ title: title.trim(), session, dayOfWeek: days }); }}
      className="bg-purple-50 rounded-2xl p-4 border border-purple-200 space-y-3"
    >
      <input
        value={title} onChange={e => setTitle(e.target.value)}
        placeholder="스킨케어 이름 (예: 토너, 에센스)"
        required
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-white"
      />
      <div className="flex gap-2">
        {[
          { key: 'morning' as const, label: '☀️ 아침', active: 'bg-yellow-400' },
          { key: 'evening' as const, label: '🌙 저녁', active: 'bg-indigo-400' },
        ].map(({ key, label, active }) => (
          <button
            key={key} type="button"
            onClick={() => setSession(key)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              session === key ? `${active} text-white` : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">요일 선택 <span className="text-red-400">*</span></p>
        <DayPicker selected={days} onChange={setDays} color="bg-purple-500" />
      </div>
      {days.length === 0 && <p className="text-xs text-red-400">요일을 하나 이상 선택해주세요</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-600">취소</button>
        <button type="submit" className="flex-1 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-medium">저장</button>
      </div>
    </form>
  );
}

function DayBadges({ days, color }: { days: string[]; color: string }) {
  return (
    <div className="flex gap-1 mt-2 flex-wrap">
      {DAYS.map(d => (
        <span
          key={d}
          className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-medium ${
            days.includes(d) ? `${color} text-white` : 'bg-gray-100 text-gray-300'
          }`}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

export default function RoutineView({ exercises, skincares, onAdd, onUpdate, onDelete }: Props) {
  const [subTab, setSubTab] = useState<'exercise' | 'skincare'>('exercise');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleAddExercise = async (data: any) => {
    await onAdd({ ...data, type: 'exercise' });
    setShowAdd(false);
  };

  const handleAddSkincare = async (data: any) => {
    await onAdd({ ...data, type: 'skincare' });
    setShowAdd(false);
  };

  const handleUpdate = async (id: string, data: any) => {
    await onUpdate(id, data);
    setEditId(null);
  };

  const switchTab = (t: 'exercise' | 'skincare') => {
    setSubTab(t);
    setShowAdd(false);
    setEditId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">루틴 관리</h2>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditId(null); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-white ${
            subTab === 'exercise' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'
          }`}
        >
          <Plus size={15} /> 추가
        </button>
      </div>

      {/* 서브탭 */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {[
          { id: 'exercise' as const, label: '💪 운동' },
          { id: 'skincare' as const, label: '✨ 스킨케어' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              subTab === id ? `bg-white shadow-sm ${id === 'exercise' ? 'text-blue-600' : 'text-purple-600'}` : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 추가 폼 */}
      {showAdd && subTab === 'exercise' && (
        <ExerciseForm onSubmit={handleAddExercise} onCancel={() => setShowAdd(false)} color="bg-blue-500" />
      )}
      {showAdd && subTab === 'skincare' && (
        <SkincareForm onSubmit={handleAddSkincare} onCancel={() => setShowAdd(false)} />
      )}

      {/* 운동 리스트 */}
      {subTab === 'exercise' && (
        <div className="space-y-2">
          {exercises.length === 0 && !showAdd && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">💪</p>
              <p className="text-sm">운동 루틴이 없어요</p>
              <p className="text-xs mt-1">추가 버튼으로 루틴을 만들어보세요</p>
            </div>
          )}
          {exercises.map(ex => (
            editId === ex.id ? (
              <ExerciseForm
                key={ex.id}
                initial={ex}
                onSubmit={d => handleUpdate(ex.id, d)}
                onCancel={() => setEditId(null)}
                color="bg-blue-500"
              />
            ) : (
              <div key={ex.id} className="bg-white rounded-2xl p-4 border border-blue-100">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{ex.title}</p>
                    {ex.youtubeUrl && (
                      <a href={ex.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline">
                        유튜브 링크 ↗
                      </a>
                    )}
                    <DayBadges days={ex.dayOfWeek} color="bg-blue-500" />
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditId(ex.id); setShowAdd(false); }}
                      className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(ex.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* 스킨케어 리스트 */}
      {subTab === 'skincare' && (
        <div className="space-y-4">
          {skincares.length === 0 && !showAdd && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">✨</p>
              <p className="text-sm">스킨케어 루틴이 없어요</p>
              <p className="text-xs mt-1">추가 버튼으로 루틴을 만들어보세요</p>
            </div>
          )}
          {(['morning', 'evening'] as const).map(sess => {
            const items = skincares.filter(s => s.session === sess);
            if (!items.length) return null;
            return (
              <div key={sess}>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  {sess === 'morning' ? '☀️ 아침 루틴' : '🌙 저녁 루틴'}
                </p>
                <div className="space-y-2">
                  {items.map(item => (
                    editId === item.id ? (
                      <SkincareForm
                        key={item.id}
                        initial={item}
                        onSubmit={d => handleUpdate(item.id, d)}
                        onCancel={() => setEditId(null)}
                      />
                    ) : (
                      <div key={item.id} className="bg-white rounded-2xl p-4 border border-purple-100">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.title}</p>
                            <DayBadges days={item.dayOfWeek} color="bg-purple-500" />
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => { setEditId(item.id); setShowAdd(false); }}
                              className="p-1.5 text-gray-300 hover:text-purple-500 transition-colors">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => onDelete(item.id)}
                              className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
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
