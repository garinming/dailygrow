'use client';

import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import CalorieTracker from '@/components/dashboard/CalorieTracker';
import ExerciseList from '@/components/dashboard/ExerciseList';
import SkincareChecklist from '@/components/dashboard/SkincareChecklist';
import { Flame, Dumbbell, Sparkles, LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

// Firestore 데이터 타입 정의
interface DietRecord {
  id: string;
  userId: string;
  date: string;
  foodName: string;
  calories: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface ExerciseRecord {
  id: string;
  userId: string;
  title: string;
  youtubeUrl: string;
  dayOfWeek: string[];
  isCompleted: boolean;
  completedDates?: string[];
}

interface SkincareItem {
  id: string;
  userId: string;
  title: string;
  session: 'morning' | 'evening';
  dayOfWeek: string[];
  isSpecial?: boolean;
  specialDay?: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [diets, setDiets] = useState<DietRecord[]>([]);
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [skincare, setSkincare] = useState<SkincareItem[]>([]);
  const router = useRouter();

  // 오늘 날짜 문자열 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()];

  useEffect(() => {
    // 인증 상태 감시
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
      } else {
        // 로그인 안 된 상태: 로그인 페이지로 리다이렉트 (暂时 пока 데모 데이터 사용)
        setUser({ uid: 'demo-user', displayName: 'Demo User' });
        await fetchDemoData();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 실제 Firestore에서 데이터 가져오기
  const fetchUserData = async (userId: string) => {
    try {
      // 식단 데이터 가져오기
      const dietQuery = query(
        collection(db, 'diets'),
        where('userId', '==', userId),
        where('date', '==', today)
      );
      const dietSnapshot = await getDocs(dietQuery);
      const dietData = dietSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DietRecord));
      setDiets(dietData);

      // 운동 데이터 가져오기
      const exerciseQuery = query(
        collection(db, 'routines'),
        where('userId', '==', userId),
        where('type', '==', 'exercise')
      );
      const exerciseSnapshot = await getDocs(exerciseQuery);
      const exerciseData = exerciseSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ExerciseRecord));
      setExercises(exerciseData);

      // 스킨케어 데이터 가져오기
      const skincareQuery = query(
        collection(db, 'routines'),
        where('userId', '==', userId),
        where('type', '==', 'skin')
      );
      const skincareSnapshot = await getDocs(skincareQuery);
      const skincareData = skincareSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SkincareItem));
      setSkincare(skincareData);
    } catch (error) {
      console.error('Firestore 데이터 가져오기 오류:', error);
    }
  };

  // 데모 데이터 (테스트용)
  const fetchDemoData = async () => {
    // Mock 식단 데이터
    setDiets([
      { id: '1', userId: 'demo', date: today, foodName: '현미밥', calories: 350, type: 'breakfast' },
      { id: '2', userId: 'demo', date: today, foodName: '닭가슴살 샐러드', calories: 280, type: 'lunch' },
      { id: '3', userId: 'demo', date: today, foodName: '연어 구이', calories: 420, type: 'dinner' },
      { id: '4', userId: 'demo', date: today, foodName: '요거트', calories: 120, type: 'snack' },
    ]);

    // Mock 운동 데이터
    setExercises([
      { id: '1', userId: 'demo', title: '15분 전신 운동', youtubeUrl: 'https://www.youtube.com/watch?v=1f8yoFFdkcY', dayOfWeek: ['월', '수', '금'], isCompleted: false },
      { id: '2', userId: 'demo', title: '복부 운동 10분', youtubeUrl: 'https://www.youtube.com/watch?v=1f8yoFFdkcY', dayOfWeek: ['화', '목', '토'], isCompleted: true },
      { id: '3', userId: 'demo', title: '요가拉伸', youtubeUrl: 'https://www.youtube.com/watch?v=1f8yoFFdkcY', dayOfWeek: ['일'], isCompleted: false },
    ]);

    // Mock 스킨케어 데이터
    setSkincare([
      { id: '1', userId: 'demo', title: '클렌저', session: 'morning', dayOfWeek: ['월', '화', '수', '목', '금', '토', '일'] },
      { id: '2', userId: 'demo', title: '토너', session: 'morning', dayOfWeek: ['월', '화', '수', '목', '금', '토', '일'] },
      { id: '3', userId: 'demo', title: '에센스', session: 'morning', dayOfWeek: ['월', '화', '수', '목', '금', '토', '일'] },
      { id: '4', userId: 'demo', title: '크림', session: 'morning', dayOfWeek: ['월', '화', '수', '목', '금', '토', '일'] },
      { id: '5', userId: 'demo', title: '클렌저', session: 'evening', dayOfWeek: ['월', '화', '수', '목', '금', '토', '일'] },
      { id: '6', userId: 'demo', title: '토너', session: 'evening', dayOfWeek: ['월', '화', '수', '목', '금', '토', '일'] },
      { id: '7', userId: 'demo', title: '앰플', session: 'evening', dayOfWeek: ['월', '화', '수', '목', '금', '토', '일'] },
      { id: '8', userId: 'demo', title: '크림', session: 'evening', dayOfWeek: ['월', '화', '수', '목', '금', '토', '일'] },
      { id: '9', userId: 'demo', title: '각질제거', session: 'evening', dayOfWeek: ['수'], isSpecial: true, specialDay: '수' },
    ]);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 오늘 총 칼로리
  const totalCalories = diets.reduce((sum, diet) => sum + diet.calories, 0);
  const calorieGoal = 2000; // 기본 목표 칼로리

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Daily Glow & Grow
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} {dayOfWeek}요일
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {user?.displayName || '사용자'}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="로그아웃"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 대시보드 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 칼로리 현황 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="text-orange-500" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">오늘의 칼로리</h2>
            </div>
            <CalorieTracker totalCalories={totalCalories} goal={calorieGoal} diets={diets} />
          </div>

          {/* 운동 영상 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Dumbbell className="text-blue-500" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">오늘의 운동</h2>
            </div>
            <ExerciseList exercises={exercises} todayDayOfWeek={dayOfWeek} />
          </div>

          {/* 스킨케어 체크리스트 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="text-purple-500" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">오늘의 스킨케어</h2>
            </div>
            <SkincareChecklist items={skincare} todayDayOfWeek={dayOfWeek} />
          </div>
        </div>
      </main>
    </div>
  );
}