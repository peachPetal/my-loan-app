'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast'; // import 필수

export default function EditLoanPage() {
  const router = useRouter();
  const params = useParams();
  
  // ✅ 핵심 수정: params.id를 미리 string으로 단언해서 변수에 담아둡니다.
  // 이렇게 하면 아래에서 쓸 때 에러가 나지 않습니다.
  const loanId = params.id as string; 

  const { fetchLoans } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    rate: '',
    grace_period: '',
    repayment_period: '',
    start_date: '',
  });

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    const getLoan = async () => {
      if (!loanId) return; // 방어 코드

      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId) // ✅ params.id 대신 loanId 사용
        .single();

      if (data && !error) {
        setFormData({
          name: data.name,
          amount: data.amount.toLocaleString(),
          rate: String(data.rate),
          grace_period: String(data.grace_period),
          repayment_period: String(data.repayment_period),
          start_date: data.start_date,
        });
      }
    };
    getLoan();
  }, [loanId]);

  // 포맷팅 함수들 (이전과 동일)
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

  // 2. 수정(Update) 처리
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.from('loans').update({
        name: formData.name,
        amount: Number(formData.amount.replace(/,/g, '')),
        rate: Number(formData.rate),
        grace_period: Number(formData.grace_period || 0),
        repayment_period: Number(formData.repayment_period || 0),
        start_date: formData.start_date,
      })
      .eq('id', loanId); // ✅ params.id 대신 loanId 사용

      if (error) throw error;
      await fetchLoans();
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 삭제(Delete) 처리 - Toast Confirm 방식
  const handleDelete = () => {
    // 일반 confirm 대신 커스텀 토스트를 띄웁니다.
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">정말 삭제할까요?</span>
        <div className="flex gap-2">
          {/* 취소 버튼 */}
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-gray-600 text-xs rounded-lg hover:bg-gray-500 text-white"
          >
            취소
          </button>
          {/* 삭제 실행 버튼 */}
          <button
            onClick={() => {
              toast.dismiss(t.id); // 토스트 닫기
              executeDelete();     // 실제 삭제 함수 실행
            }}
            className="px-3 py-1.5 bg-red-500 text-xs rounded-lg hover:bg-red-400 text-white font-bold"
          >
            삭제
          </button>
        </div>
      </div>
    ), {
      duration: 4000, // 4초 동안 떠 있음
      position: 'bottom-center',
      style: { background: '#333', color: '#fff', maxWidth: '350px' }
    });
  };

  // 실제 삭제 로직은 함수로 따로 뺍니다
  const executeDelete = async () => {
    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', loanId);
        
      if (error) throw error;
      
      toast.success('삭제되었습니다.'); // 완료 메시지
      await fetchLoans();
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 pt-6 pb-24">
      <header className="flex items-center mb-8 justify-between">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600">← 뒤로</button>
          <h1 className="text-xl font-bold ml-2">대출 정보 수정</h1>
        </div>
        <button onClick={handleDelete} className="text-red-500 text-sm underline p-2">삭제</button>
      </header>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">대출 이름</label>
            <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">대출 원금</label>
            <input type="text" inputMode="numeric" className="w-full p-4 bg-gray-50 rounded-2xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount} onChange={handleAmountChange} required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이자율</label>
            <input type="number" step="0.1" className="w-full p-4 bg-gray-50 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} required />
        </div>
        <div className="flex gap-4">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">거치 기간</label>
                <input type="text" inputMode="numeric" className="w-full p-4 bg-gray-50 rounded-2xl text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.grace_period} onChange={(e) => handleNumberChange(e, 'grace_period')} />
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">상환 기간</label>
                <input type="text" inputMode="numeric" className="w-full p-4 bg-gray-50 rounded-2xl text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.repayment_period} onChange={(e) => handleNumberChange(e, 'repayment_period')} required />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">대출 실행일</label>
            <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 max-w-[420px] mx-auto">
          <button type="submit" disabled={isLoading} className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl text-lg active:bg-blue-600 disabled:opacity-50 transition-colors">
            {isLoading ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </form>
    </main>
  );
}