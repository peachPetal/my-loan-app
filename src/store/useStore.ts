/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase'; // 자동 생성된 타입 import

// DB의 'loans' 테이블의 행(Row) 타입 가져오기
type Loan = Database['public']['Tables']['loans']['Row'];

interface State {
  // 상태 (Data)
  user: any | null; // Supabase User 객체
  loans: Loan[];    // 대출 목록
  isLoading: boolean;

  // 액션 (Functions)
  setUser: (user: any | null) => void;
  fetchLoans: () => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  user: null,
  loans: [],
  isLoading: false,

  // 유저 정보 저장
  setUser: (user) => set({ user }),

  // Supabase에서 대출 목록 가져오기
  fetchLoans: async () => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false }); // 최신순 정렬

      if (error) {
        console.error('Error fetching loans:', error);
      } else {
        set({ loans: data || [] });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));

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