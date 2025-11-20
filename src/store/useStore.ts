/* src/store/useStore.ts - 앱의 데이터 관리 소장님 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase'; // Supabase 자동 생성 타입

// DB의 'loans' 테이블 행 타입 가져오기
type Loan = Database['public']['Tables']['loans']['Row'];

interface State {
  // ========== 상태 (Data) ==========
  user: any | null; // Supabase User 객체
  loans: Loan[];    // 대출 목록
  isLoading: boolean;
  isAuthInitialized: boolean; // ✅ 인증 초기화 완료 여부 (로딩 상태 관리용)

  // ========== 액션 (Functions) ==========
  setUser: (user: any | null) => void;
  setAuthInitialized: (value: boolean) => void; // ✅ 인증 초기화 상태 설정
  fetchLoans: () => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  // ========== 초기 상태 ==========
  user: null,
  loans: [],
  isLoading: false,
  isAuthInitialized: false, // ✅ 초기엔 false (아직 인증 상태 확인 중)

  // ========== 액션 구현 ==========
  
  /** 유저 정보 저장 */
  setUser: (user) => set({ user }),

  /** 인증 초기화 상태 설정 (AuthListener에서 사용) */
  setAuthInitialized: (value) => set({ isAuthInitialized: value }),

  /** Supabase에서 대출 목록 가져오기 */
  fetchLoans: async () => {
    // 이미 로딩 중이면 중복 요청 방지
    if (get().isLoading) return; 
    
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false }); // 최신순 정렬

      if (error) {
        console.error('❌ 대출 목록 불러오기 실패:', error);
        // 오류 시 빈 배열로 초기화
        set({ loans: [] });
      } else {
        set({ loans: data || [] });
      }
    } catch (err) {
      console.error('예상치 못한 오류:', err);
      set({ loans: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));

/**
 * useStore 역할 요약:
 * 
 * 1. 데이터 보관소 (Central Storage)
 *    - user: "누가 로그인했나?"
 *    - loans: "대출 목록은 뭐가 있나?"
 *    - isAuthInitialized: "인증 상태 확인 끝났나?"
 * 
 * 2. 데이터 배달부 (Data Fetcher)
 *    - fetchLoans(): Supabase에서 데이터 가져와서 loans에 저장
 *    - 각 페이지는 DB 코드 몰라도 "소장님, 데이터 좀!" 하면 됨
 * 
 * 3. 상태 알리미 (State Notifier)
 *    - isLoading: "지금 로딩 중이야" → UI에서 스켈레톤/로딩 화면 표시
 *    - isAuthInitialized: "인증 확인 중이야" → 로그인 페이지로 가기 전까지 대기
 */

// src/store/useStore.ts의 역할은 우리 앱의 **"데이터 관리 소장님"**입니다.

// 복잡하게 생각할 것 없이 딱 3가지 일만 합니다.

// 데이터 보관 (창고)

// "누가 로그인했지?" (user)

// "대출 목록이 뭐지?" (loans)

// 이 데이터를 보관하고 있다가, 어떤 페이지에서든 부르면 바로 건네줍니다.

// 데이터 배달 (심부름꾼)

// fetchLoans() 함수가 실행되면, 직접 Supabase DB에 가서 최신 대출 목록을 받아와서 창고(loans)에 채워 넣습니다.

// 각 페이지는 복잡한 DB 코드를 몰라도, 그냥 "소장님, 데이터 좀 채워주세요(fetchLoans)"라고 부탁만 하면 됩니다.

// 상태 알림 (상황판)

// "지금 데이터를 가져오는 중인가요?" (isLoading)

// 이걸 보고 프론트엔드에서는 뱅글뱅글 도는 로딩 화면을 보여줄지, 데이터를 보여줄지 결정합니다.