"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import LoanCard from "@/components/features/LoanCard";
import LoanCardSkeleton from "@/components/skeletons/LoanCardSkeleton";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";

export default function HomePage() {
  // ✅ isAuthInitialized 추가
  const { user, loans, fetchLoans, isLoading, isAuthInitialized } = useStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // 유저가 있고 인증 확인이 끝났을 때만 데이터 로드
    if (isAuthInitialized && user) {
      fetchLoans();
    }
  }, [user, fetchLoans, isAuthInitialized]);

  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);

  const handleLogout = () => {
    console.log("로그아웃 버튼 클릭됨!");
    
    if (isLoggingOut) return;

    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">로그아웃 하시겠습니까?</span>    
          <div className="flex gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-600 text-xs rounded-lg hover:bg-gray-500 text-white transition-colors pointer-events-auto z-9999"
            >
              취소
            </button>
            
            <button
              onClick={async () => {
                console.log("로그아웃 실행 시작");
                setIsLoggingOut(true);
                toast.dismiss(t.id);

                try {
                  // ✅ 수정된 부분: 에러 처리 로직 강화
                  const { error } = await supabase.auth.signOut();
                  
                  // AuthSessionMissingError는 이미 로그아웃 된 상태이므로 에러로 보지 않음
                  if (error) {
                    if (error.message === 'Auth session missing!' || error.name === 'AuthSessionMissingError') {
                      console.warn('이미 세션이 종료된 상태입니다. 로그아웃 처리합니다.');
                    } else {
                      throw error; // 진짜 에러는 던짐
                    }
                  }

                  // 정상 로그아웃 처리
                  toast.success("로그아웃 되었습니다.");
                  console.log("로그아웃 성공");
                  
                  // AuthListener가 감지하겠지만, 확실하게 하기 위해 수동으로 이동할 수도 있음
                  router.replace('/login'); 

                } catch (error) {
                  console.error("로그아웃 실패:", error);
                  
                  // 실패했더라도 사용자 입장에서는 로그아웃 시켜주는 것이 UX상 좋음
                  // (토큰이 꼬인 상태일 수 있으므로)
                  toast.error("로그아웃 처리 중 오류가 있었지만 종료합니다.");
                  router.replace('/login');
                  
                  setIsLoggingOut(false);
                }
              }}
              className="px-3 py-1.5 bg-red-500 text-xs rounded-lg text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50 pointer-events-auto z-9999"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? '처리중...' : '로그아웃'}
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "bottom-center",
        style: { background: "#333", color: "#fff", borderRadius: "16px" },
      }
    );
  };

  // ✅ [핵심] 인증 상태 확인 중이거나, 로그인하지 않은 상태라면 화면을 숨김
  // (AuthListener가 로그인 페이지로 이동시킬 때까지 빈 화면 유지)
  if (!isAuthInitialized || !user) {
    return null; // 또는 <div className="min-h-screen bg-white" /> 로 흰 화면 유지
  }

  return (
    <>
      <Toaster position="bottom-center" />
      
      {/* ✅ 수정: min-h-[100dvh] 대신 min-h-full 사용 (부모 높이 상속) */}
      <main className="min-h-full bg-gray-50 pb-24">
        {/* 상단 헤더 */}
        <div className="bg-blue-500 pt-12 pb-8 px-6 rounded-b-4xl shadow-sm text-white">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">내 대출 현황</h1>
            <button
              onClick={handleLogout}
              className="text-blue-100 text-sm hover:text-white px-4 py-2 rounded-md hover:bg-blue-600/30 transition-colors transform active:scale-95 cursor-pointer z-10"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? '처리중...' : '로그아웃'}
            </button>
          </div>

          <div>
            <p className="text-blue-100 text-sm mb-1">총 대출 잔액</p>
            {isLoading ? (
              <div className="h-9 w-48 bg-blue-400/50 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-4xl font-extrabold">
                {totalAmount.toLocaleString()}원
              </p>
            )}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="px-5 -mt-4">
          <div
            onClick={() => router.push("/summary")}
            className="bg-white p-5 rounded-2xl shadow-md mb-6 flex justify-between items-center cursor-pointer active:bg-gray-50 transition-colors"
          >
            <div>
              <h3 className="font-bold text-gray-800">💰 상환 계획 요약보기</h3>
              <p className="text-gray-500 text-sm mt-1">
                언제부터 얼마씩 내야 할까요?
              </p>
            </div>
            <span className="text-gray-300 text-xl">👉</span>
          </div>

          {/* 대출 목록 리스트 */}
          <div className="space-y-5">
            <div className="flex justify-between items-center px-1">
              <h2 className="font-bold text-gray-700">
                대출 목록 ({isLoading ? "-" : loans.length})
              </h2>
            </div>

            {isLoading ? (
              <>
                <LoanCardSkeleton />
                <LoanCardSkeleton />
                <LoanCardSkeleton />
              </>
            ) : loans.length > 0 ? (
              loans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                <p className="text-gray-400 mb-2">등록된 대출이 없어요</p>
                <p className="text-sm text-gray-300">
                  아래 + 버튼을 눌러 추가해보세요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => router.push("/add")}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 text-3xl flex items-center justify-center active:scale-90 transition-transform z-50"
          style={{
            right: "max(1.5rem, calc((100vw - 420px) / 2 + 1.5rem))",
            bottom: "max(1.5rem, env(safe-area-inset-bottom))",
          }}
        >
          +
        </button>
      </main>
    </>
  );
}