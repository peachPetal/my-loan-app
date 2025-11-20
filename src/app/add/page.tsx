'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

export default function AddLoanPage() {
  const router = useRouter();
  const { user, fetchLoans } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  // 모든 입력을 일단 문자열(string)로 관리해야 UX 처리가 쉽습니다.
  const [formData, setFormData] = useState({
    name: '',
    amount: '',         // 콤마 처리를 위해 string
    rate: '',
    grace_period: '',   // '0' 문제 해결을 위해 빈 문자열로 시작
    repayment_period: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  // 숫자만 남기고 콤마 찍어주는 함수
  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, ''); // 숫자 외 제거
    return num ? Number(num).toLocaleString() : '';
  };

  // 금액 입력 핸들러
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, ''); // 기존 콤마 제거
    if (isNaN(Number(rawValue))) return; // 숫자가 아니면 무시
    setFormData({ ...formData, amount: formatNumber(rawValue) });
  };

  // 일반 숫자 입력 핸들러 (0이 앞에 붙는 것 방지)
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.from('loans').insert({
        user_id: user.id,
        name: formData.name,
        // 저장할 때는 콤마 제거하고 숫자로 변환
        amount: Number(formData.amount.replace(/,/g, '')),
        rate: Number(formData.rate),
        // 빈 값이면 0으로 처리
        grace_period: Number(formData.grace_period || 0),
        repayment_period: Number(formData.repayment_period || 0),
        start_date: formData.start_date,
      });

      if (error) throw error;

      toast.success('성공적으로 저장했어요!');
      
      await fetchLoans();
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 pt-6 pb-24">
      <header className="flex items-center mb-8">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600">← 뒤로</button>
        <h1 className="text-xl font-bold ml-2">대출 정보 입력</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">대출 이름</label>
          <input
            type="text" required placeholder="예: 2023 1학기 생활비"
            className="w-full p-4 bg-gray-50 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* 1. 금액 입력 (콤마 적용) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">대출 원금 (원)</label>
          <input
            type="text" inputMode="numeric" required placeholder="0"
            className="w-full p-4 bg-gray-50 rounded-2xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.amount}
            onChange={handleAmountChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이자율 (%)</label>
          <input
            type="number" step="0.1" inputMode="decimal" required placeholder="1.7"
            className="w-full p-4 bg-gray-50 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
          />
        </div>

        <div className="flex gap-4">
          {/* 2. 거치/상환 기간 (초기값 0 제거) */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">거치 기간 (개월)</label>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0"
              className="w-full p-4 bg-gray-50 rounded-2xl text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.grace_period}
              onChange={(e) => handleNumberChange(e, 'grace_period')}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">상환 기간 (개월)</label>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" required
              className="w-full p-4 bg-gray-50 rounded-2xl text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.repayment_period}
              onChange={(e) => handleNumberChange(e, 'repayment_period')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">대출 실행일</label>
          <input
            type="date" required
            className="w-full p-4 bg-gray-50 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 max-w-[420px] mx-auto">
          <button type="submit" disabled={isLoading} className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl text-lg active:bg-blue-600 disabled:opacity-50 transition-colors">
            {isLoading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </main>
  );
}