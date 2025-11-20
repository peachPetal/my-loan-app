'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export default function AuthListener() {
  const { setUser, setAuthInitialized } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      
      if (!isMounted) return;
      
      setUser(user);
      setAuthInitialized(true); // ✅ 인증 확인 완료!


      // ✅ 핵심: 초기 접근 시 비로그인이면 즉시 리다이렉트
      if (!user && pathname !== '/login') {
        router.replace('/login');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      setUser(session?.user ?? null);

      // 기존 이벤트 기반 리다이렉트 (로그아웃 후 처리)
      if (event === 'SIGNED_OUT' && pathname !== '/login') {
        router.replace('/login');
      } else if (event === 'SIGNED_IN' && pathname === '/login') {
        router.replace('/');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, router, pathname, setAuthInitialized]);

  return null;
}

// 좋습니다! **AuthListener**는 앱이라는 건물의 '경비실' 같은 존재입니다. 사용자가 문을 열고 들어올 때(앱 접속), 누군지 확인하고 "이분은 회원님입니다"라고 Store(소장님)에게 알려주는 역할을 하죠.

// 이 컴포넌트는 화면에는 보이지 않지만, 백그라운드에서 항상 작동합니다.
