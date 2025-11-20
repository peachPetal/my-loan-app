'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 로그인 후 돌아올 주소 (현재 도메인)
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다.');
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen px-6 bg-white">
      {/* 상단 여백 확보 및 타이틀 영역 */}
      <div className="flex-1 flex flex-col justify-center pb-20">
        <div className="space-y-2 mb-10 animate-fade-in-up">
          <span className="text-blue-500 font-bold text-lg tracking-tight">
            학자금 대출 관리
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            복잡한 상환 일정,<br />
            <span className="text-blue-600">한눈에 요약</span>해드려요.
          </h1>
          <p className="text-gray-500 text-base mt-2">
            로그인하고 내 대출 정보를 입력해보세요.
          </p>
        </div>

        {/* 일러스트나 아이콘 자리 (여기선 심플하게 이모지로 대체) */}
        <div className="flex justify-center mb-12 animate-bounce-slow">
          <span className="text-8xl">🎓</span>
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="mb-10 safe-area-bottom">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={`
            w-full relative flex items-center justify-center gap-3 
            bg-white border border-gray-200 text-gray-700 
            font-semibold text-lg h-14 rounded-2xl shadow-sm 
            active:scale-[0.98] active:bg-gray-50 transition-all duration-200
            ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'}
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-gray-500">
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              연결 중...
            </span>
          ) : (
            <>
              {/* 구글 공식 G 로고 SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google로 계속하기
            </>
          )}
        </button>
      </div>
    </main>
  );
}