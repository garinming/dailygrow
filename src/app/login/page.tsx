'use client';

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Flame, Dumbbell, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      console.error('로그인 오류:', err);
      setError(err.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 데모 모드로 시작
  const handleDemoLogin = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col">
      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* 로고 및 타이틀 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg mb-4">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Daily Glow & Grow
            </h1>
            <p className="text-gray-600 mt-2">
              식단, 운동, 화장을 한곳에서 관리하는 자기관리 도구
            </p>
          </div>

          {/* 기능 소개 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-white/60 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2">
                <Flame className="text-orange-500" size={24} />
              </div>
              <p className="text-sm font-medium text-gray-700">식단 관리</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                <Dumbbell className="text-blue-500" size={24} />
              </div>
              <p className="text-sm font-medium text-gray-700">운동 루틴</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                <Sparkles className="text-purple-500" size={24} />
              </div>
              <p className="text-sm font-medium text-gray-700">스킨케어</p>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? '로그인 중...' : 'Google로 시작하기'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-orange-50 text-gray-500">또는</span>
              </div>
            </div>

            <button
              onClick={handleDemoLogin}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
            >
              🎉 데모 모드로 시작하기
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* 푸터 */}
          <p className="text-center text-gray-400 text-sm mt-8">
            © 2024 Daily Glow & Grow. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}