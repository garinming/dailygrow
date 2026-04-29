'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Home, Flame, ListChecks, LogOut } from 'lucide-react';
import TodayView from '@/components/views/TodayView';
import DietView from '@/components/views/DietView';
import RoutineView from '@/components/views/RoutineView';
import type { DietEntry, ExerciseRoutine, SkincareRoutine } from '@/types';

type Tab = 'today' | 'diet' | 'routine';

const TABS = [
  { id: 'today' as Tab, label: '오늘', Icon: Home },
  { id: 'diet' as Tab, label: '식단', Icon: Flame },
  { id: 'routine' as Tab, label: '루틴', Icon: ListChecks },
];

export default function MainPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('today');
  const [diets, setDiets] = useState<DietEntry[]>([]);
  const [exercises, setExercises] = useState<ExerciseRoutine[]>([]);
  const [skincares, setSkincares] = useState<SkincareRoutine[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.replace('/login'); return; }
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const dietQ = query(collection(db, 'diets'), where('userId', '==', user.uid));
    const routineQ = query(collection(db, 'routines'), where('userId', '==', user.uid));

    const unsubDiet = onSnapshot(dietQ, snap =>
      setDiets(snap.docs.map(d => ({ id: d.id, ...d.data() } as DietEntry)))
    );
    const unsubRoutine = onSnapshot(routineQ, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setExercises(all.filter(r => r.type === 'exercise'));
      setSkincares(all.filter(r => r.type === 'skincare'));
    });
    return () => { unsubDiet(); unsubRoutine(); };
  }, [user]);

  const addDiet = (data: Omit<DietEntry, 'id' | 'userId'>) =>
    addDoc(collection(db, 'diets'), { ...data, userId: user.uid });

  const deleteDiet = (id: string) => deleteDoc(doc(db, 'diets', id));

  const addRoutine = (data: any) =>
    addDoc(collection(db, 'routines'), { ...data, userId: user.uid, completedDates: [] });

  const updateRoutine = (id: string, data: any) =>
    updateDoc(doc(db, 'routines', id), data);

  const deleteRoutine = (id: string) => deleteDoc(doc(db, 'routines', id));

  const toggleComplete = (id: string, completedDates: string[]) => {
    const newDates = completedDates.includes(today)
      ? completedDates.filter(d => d !== today)
      : [...completedDates, today];
    return updateDoc(doc(db, 'routines', id), { completedDates: newDates });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Daily Glow & Grow
          </h1>
          <button
            onClick={() => signOut(auth).then(() => router.replace('/login'))}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            title="로그아웃"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {tab === 'today' && (
          <TodayView
            today={today}
            dayOfWeek={dayOfWeek}
            diets={diets.filter(d => d.date === today)}
            exercises={exercises.filter(e => e.dayOfWeek.includes(dayOfWeek))}
            skincares={skincares.filter(s => s.dayOfWeek.includes(dayOfWeek))}
            onToggleComplete={toggleComplete}
          />
        )}
        {tab === 'diet' && (
          <DietView diets={diets} onAdd={addDiet} onDelete={deleteDiet} />
        )}
        {tab === 'routine' && (
          <RoutineView
            exercises={exercises}
            skincares={skincares}
            onAdd={addRoutine}
            onUpdate={updateRoutine}
            onDelete={deleteRoutine}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
                tab === id ? 'text-orange-500' : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
