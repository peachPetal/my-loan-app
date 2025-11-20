'use client'; // 브라우저에서 작동하는 코드이므로 필수

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export default function AuthListener() {
  const { setUser } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. 초기 세션 확인 (앱 켜자마자 실행)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkSession();

    // 2. 인증 상태 변화 감지 (로그인/로그아웃 순간 실행)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // 로그아웃 하면 로그인 페이지로 튕겨내기
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } 
      // 로그인 하면 홈으로 이동 (단, 로그인 페이지에 있을 때만)
      else if (event === 'SIGNED_IN' && pathname === '/login') {
        router.push('/');
      }
    });

    // 3. 청소 (컴포넌트가 사라질 때 감지 중단)
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, router, pathname]);

  return null; // 화면에는 아무것도 그리지 않음
}

// 좋습니다! **AuthListener**는 앱이라는 건물의 '경비실' 같은 존재입니다. 사용자가 문을 열고 들어올 때(앱 접속), 누군지 확인하고 "이분은 회원님입니다"라고 Store(소장님)에게 알려주는 역할을 하죠.

// 이 컴포넌트는 화면에는 보이지 않지만, 백그라운드에서 항상 작동합니다.