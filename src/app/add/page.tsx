'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import toast, { Toaster } from 'react-hot-toast';

export default function AddLoanPage() {
  const router = useRouter();
  const { user, fetchLoans } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    rate: '',
    grace_period: '',
    repayment_period: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? Number(num).toLocaleString() : '';
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (isNaN(Number(rawValue))) return;
    setFormData({ ...formData, amount: formatNumber(rawValue) });
  };

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
        amount: Number(formData.amount.replace(/,/g, '')),
        rate: Number(formData.rate),
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
    <>
      <Toaster position="bottom-center" />
      
      <main className="min-h-screen bg-white pb-24">
        {/* ✅ 헤더: 중앙 정렬 제목 + 절대 위치 버튼 */}
        <header className="relative px-6 py-5 border-b border-gray-100">
          {/* 뒤로가기 버튼 */}
          <button 
            onClick={() => router.back()} 
            className="absolute left-6 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 뒤로
          </button>
          
          {/* 중앙 제목 */}
          <h1 className="text-center text-lg font-bold text-gray-900">대출 정보 입력</h1>
        </header>

        {/* ✅ 폼: 통일된 입력 스타일 */}
        <form onSubmit={handleSubmit} className="px-6 pt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대출 이름</label>
            <input
              type="text" 
              required 
              placeholder="예: 2025 1학기"
              className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대출 원금 (원)</label>
            <input
              type="text" 
              inputMode="numeric" 
              required 
              placeholder="0"
              className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.amount}
              onChange={handleAmountChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이자율 (%)</label>
            <input
              type="number" 
              step="0.1" 
              inputMode="decimal" 
              required 
              placeholder="0.1"
              className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">거치 기간 (개월)</label>
              <input
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                placeholder="0"
                className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.grace_period}
                onChange={(e) => handleNumberChange(e, 'grace_period')}
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">상환 기간 (개월)</label>
              <input
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                placeholder="0"
                required
                className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.repayment_period}
                onChange={(e) => handleNumberChange(e, 'repayment_period')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대출 실행일</label>
            <input
              type="date" 
              required
              className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>

          {/* ✅ 하단 버튼: 고정 위치 + 통일된 스타일 */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 max-w-[420px] mx-auto">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl text-base active:bg-blue-600 disabled:opacity-50 transition-colors transform active:scale-[0.98]"
            >
              {isLoading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}