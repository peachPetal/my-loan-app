"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import LoanCard from "@/components/features/LoanCard";
import LoanCardSkeleton from "@/components/skeletons/LoanCardSkeleton"; // 1. import
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function HomePage() {
  const { user, loans, fetchLoans, isLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    // user가 로드된 상태에서만 fetchLoans 실행
    if (user) fetchLoans();
  }, [user, fetchLoans]); // 의존성 배열 수정

  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);

  const handleLogout = () => {
    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">로그아웃 하시겠습니까?</span>   
          <div className="flex gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-600 text-xs rounded-lg hover:bg-gray-500 text-white transition-colors"
            >
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id); // 1. 토스트 닫기

                try {
                  // 2. 로그아웃 실행
                  const { error } = await supabase.auth.signOut();
                  if (error) throw error;

                  // 3. 메시지 표시
                  toast.success("로그아웃 되었습니다.");

                  // 4. 🚀 [핵심] 로그인 페이지로 강제 이동
                  router.replace("/login");
                } catch (error) {
                  console.error(error);
                  toast.error("로그아웃 실패");
                }
              }}
              className="px-3 py-1.5 bg-blue-500 text-xs rounded-lg text-white font-bold hover:bg-blue-400 transition-colors"
            >
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
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* 상단 헤더 */}
      <div className="bg-blue-500 pt-12 pb-8 px-6 rounded-b-4xl shadow-sm text-white transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">내 대출 현황</h1>
          <button
            onClick={handleLogout}
            className="text-blue-100 text-sm hover:text-white px-2 py-1 rounded-md hover:bg-blue-600/30 transition-colors"
          >
            로그아웃
          </button>
        </div>

        <div>
          <p className="text-blue-100 text-sm mb-1">총 대출 잔액</p>
          {/* 총 잔액 부분도 로딩 중일 땐 스켈레톤 처리 (선택 사항) */}
          {isLoading ? (
            <div className="h-9 w-48 bg-blue-400/50 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-4xl font-extrabold animate-fade-in">
              {totalAmount.toLocaleString()}원
            </p>
          )}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="px-5 -mt-4">
        {/* 상환 요약 버튼 */}
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

          {/* ✅ 2. 로딩 상태 분기 처리 수정 */}
          {isLoading ? (
            // 로딩 중일 때: 스켈레톤 3개를 보여줌
            <>
              <LoanCardSkeleton />
              <LoanCardSkeleton />
              <LoanCardSkeleton />
            </>
          ) : loans.length > 0 ? (
            // 데이터 있을 때
            loans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
          ) : (
            // 데이터 없을 때 (빈 상태)
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 text-3xl flex items-center justify-center active:scale-90 transition-transform z-50 custom-fab"
        style={{
          position: "fixed",
          right: "max(1.5rem, calc((100vw - 420px) / 2 + 1.5rem))",
        }}
      >
        +
      </button>
    </main>
  );
}
