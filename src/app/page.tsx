"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import LoanCard from "@/components/features/LoanCard";
import LoanCardSkeleton from "@/components/skeletons/LoanCardSkeleton";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast"; // ✅ Toaster import 추가

export default function HomePage() {
  const { user, loans, fetchLoans, isLoading } = useStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) fetchLoans();
  }, [user, fetchLoans]);

  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);

  const handleLogout = () => {
    // ✅ 디버깅용 로그
    console.log("로그아웃 버튼 클릭됨!");
    
    if (isLoggingOut) return;

    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">로그아웃 하시겠습니까?</span>    
          <div className="flex gap-2">
            {/* ✅ 명시적인 취소 버튼 */}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-600 text-xs rounded-lg hover:bg-gray-500 text-white transition-colors pointer-events-auto z-[9999]"
            >
              취소
            </button>
            
            {/* ✅ 로그아웃 실행 버튼 */}
            <button
              onClick={async () => {
                console.log("로그아웃 실행 시작");
                setIsLoggingOut(true);
                toast.dismiss(t.id);

                try {
                  const { error } = await supabase.auth.signOut();
                  if (error) throw error;

                  toast.success("로그아웃 되었습니다.");
                  console.log("로그아웃 성공");
                } catch (error) {
                  console.error("로그아웃 실패:", error);
                  toast.error("로그아웃 실패");
                  setIsLoggingOut(false);
                }
              }}
              className="px-3 py-1.5 bg-red-500 text-xs rounded-lg text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50 pointer-events-auto z-[9999]"
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

  return (
    <>
      {/* ✅ Toaster 컴포넌트 루트에 추가 */}
      <Toaster position="bottom-center" />
      
      <main className="min-h-[100dvh] bg-gray-50 pb-24">
        {/* 상단 헤더 */}
        <div className="bg-blue-500 pt-12 pb-8 px-6 rounded-b-4xl shadow-sm text-white">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">내 대출 현황</h1>
            
            {/* ✅ 명확한 버튼 구조와 디버깅용 클래스 */}
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