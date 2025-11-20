"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { analyzeLoan } from '@/lib/utils';

export default function SummaryPage() {
  const router = useRouter();
  // ✅ isAuthInitialized 추가
  const { loans, user, fetchLoans, isAuthInitialized } = useStore();
  
  useEffect(() => {
    if (isAuthInitialized && user && loans.length === 0) fetchLoans();
  }, [user, loans, fetchLoans, isAuthInitialized]);

  // ✅ 인증 전이면 아무것도 보여주지 않음
  if (!isAuthInitialized || !user) return null;

  const analyzedLoans = loans.map(analyzeLoan);
  // ... (통계 계산 로직 기존과 동일)
  const currentMonthlyTotal = analyzedLoans.reduce((sum, loan) => sum + loan.monthlyInterest, 0);
  const maxMonthlyTotal = analyzedLoans.reduce((sum, loan) => sum + loan.monthlyRepayment, 0);
  const firstRepaymentDate = analyzedLoans.map(l => l.graceEndDate).sort((a, b) => a.getTime() - b.getTime())[0];
  const startYear = firstRepaymentDate?.getFullYear();

  return (
    // ✅ 수정: min-h-screen -> min-h-full
    <main className="min-h-full bg-gray-50 pb-10">
      {/* ... 기존 JSX 내용 동일 ... */}
      <header className="bg-white px-6 py-4 sticky top-0 z-10 flex items-center border-b border-gray-100">
        <button onClick={() => router.back()} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-lg font-bold">상환 계획 분석</h1>
      </header>

      <div className="p-6 space-y-6">
         {/* ... (나머지 내용 기존 코드 유지) ... */}
         <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-500/20">
          <p className="text-blue-100 mb-1">미래의 최대 월 납부액</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">
              {maxMonthlyTotal.toLocaleString()}
            </span>
            <span className="text-xl">원</span>
          </div>
          <p className="text-sm text-blue-200 mt-4 bg-blue-500/50 inline-block px-3 py-1 rounded-lg">
            {startYear ? `${startYear}년부터 본격적인 상환이 시작돼요` : '대출 정보가 충분하지 않아요'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">현재 납부액 (이자)</h3>
          <p className="text-2xl font-bold text-gray-800">
            월 {currentMonthlyTotal.toLocaleString()}원
          </p>
          <p className="text-xs text-gray-400 mt-1">
            *거치 기간 동안은 이자만 납부합니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 mb-4 text-lg">대출별 상환 일정</h2>
          <div className="space-y-3">
            {analyzedLoans.map((loan) => (
              <div key={loan.id} className="bg-white p-5 rounded-2xl border border-gray-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-100"></div>
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-700">{loan.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      {loan.graceEndDate.getFullYear()}년 {loan.graceEndDate.getMonth() + 1}월 상환 시작
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs">거치기간 (~{loan.grace_period}개월)</p>
                      <p className="font-medium text-gray-600">이자 {loan.monthlyInterest.toLocaleString()}원</p>
                    </div>
                    <span className="text-gray-300">➔</span>
                    <div className="flex-1 text-right">
                      <p className="text-blue-500 text-xs font-bold">상환기간 ({loan.repayment_period}개월)</p>
                      <p className="font-bold text-blue-600">{loan.monthlyRepayment.toLocaleString()}원</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-xl text-xs text-gray-500 leading-relaxed">
          💡 <strong>알아두세요:</strong> 실제 납부일과 금액은 한국장학재단 정책 및 금리 변동에 따라 약간의 차이가 있을 수 있습니다. 이 결과는 <strong>고정금리 및 원리금 균등 상환</strong>을 기준으로 추산된 값입니다.
        </div>
      </div>
    </main>
  );
}