'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Flame, Dumbbell, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ERROR_MAP: Record<string, string> = {
    'auth/email-already-in-use': '이미 사용 중인 이메일이에요.',
    'auth/invalid-email': '이메일 형식이 올바르지 않아요.',
    'auth/user-not-found': '가입되지 않은 이메일이에요.',
    'auth/wrong-password': '비밀번호가 틀렸어요.',
    'auth/invalid-credential': '이메일 또는 비밀번호를 확인해주세요.',
    'auth/too-many-requests': '잠시 후 다시 시도해주세요.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 해요.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isSignup && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/');
    } catch (err: any) {
      setError(ERROR_MAP[err.code] || '오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg mb-3">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Daily Glow & Grow
          </h1>
          <p className="text-gray-500 text-sm mt-1">식단 · 운동 · 스킨케어 한곳에서</p>
        </div>

        {/* 기능 소개 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { Icon: Flame, color: 'orange', label: '식단' },
            { Icon: Dumbbell, color: 'blue', label: '운동' },
            { Icon: Sparkles, color: 'purple', label: '스킨케어' },
          ].map(({ Icon, color, label }) => (
            <div key={label} className="text-center p-3 bg-white/70 rounded-xl">
              <div className={`inline-flex items-center justify-center w-10 h-10 bg-${color}-100 rounded-full mb-1`}>
                <Icon className={`text-${color}-500`} size={18} />
              </div>
              <p className="text-xs font-medium text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4 text-center">
            {isSignup ? '회원가입' : '로그인'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="6자 이상"
                  required
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">비밀번호 확인</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                />
              </div>
            )}

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? '처리 중...' : isSignup ? '가입하기' : '로그인'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              {isSignup ? '이미 계정이 있어요 → 로그인' : '계정이 없어요 → 회원가입'}
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-gray-400">또는</span>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await signInAnonymously(auth);
                router.replace('/');
              } catch {
                setError('익명 로그인에 실패했어요.');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            🙈 로그인 없이 둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}
