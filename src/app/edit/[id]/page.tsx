'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import toast, { Toaster } from 'react-hot-toast';

export default function EditLoanPage() {
  const router = useRouter();
  const params = useParams();
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

  useEffect(() => {
    const getLoan = async () => {
      if (!loanId) return;
      const { data, error } = await supabase.from('loans').select('*').eq('id', loanId).single();
      
      if (data && !error) {
        setFormData({
          name: data.name,
          amount: data.amount.toLocaleString(),
          rate: String(data.rate),
          grace_period: String(data.grace_period || ''),
          repayment_period: String(data.repayment_period || ''),
          start_date: data.start_date,
        });
      }
    };
    getLoan();
  }, [loanId]);

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
      }).eq('id', loanId);

      if (error) throw error;
      await fetchLoans();
      toast.success('수정되었습니다.');
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">정말 삭제할까요?</span>
        <div className="flex gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-gray-600 text-xs rounded-lg hover:bg-gray-500 text-white">
            취소
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete();
            }}
            className="px-3 py-1.5 bg-red-500 text-xs rounded-lg hover:bg-red-400 text-white font-bold"
          >
            삭제
          </button>
        </div>
      </div>
    ), {
      duration: 4000,
      position: 'bottom-center',
      style: { background: '#333', color: '#fff', maxWidth: '350px' }
    });
  };

  const executeDelete = async () => {
    try {
      const { error } = await supabase.from('loans').delete().eq('id', loanId);
      if (error) throw error;
      toast.success('삭제되었습니다.');
      await fetchLoans();
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <Toaster position="bottom-center" />
      
      <main className="min-h-screen bg-white pb-24">
        {/* ✅ 헤더: 중앙 정렬 + 절대 위치 버튼 */}
        <header className="relative px-6 py-5 border-b border-gray-100">
          {/* 뒤로가기 버튼 */}
          <button onClick={() => router.back()} className="absolute left-6 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
            ← 뒤로
          </button>
          
          {/* 중앙 제목 */}
          <h1 className="text-center text-lg font-bold text-gray-900">대출 정보 수정</h1>
          
          {/* 삭제 버튼 */}
          <button onClick={handleDelete} className="absolute right-6 top-1/2 -translate-y-1/2 text-red-500 text-sm font-medium hover:text-red-600 transition-colors">
            삭제
          </button>
        </header>

        {/* ✅ 입력 폼: 통일된 스타일 */}
        <form onSubmit={handleUpdate} className="px-6 pt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대출 이름</label>
            <input 
              type="text" 
              className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대출 원금</label>
            <input 
              type="text" 
              inputMode="numeric" 
              className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.amount} 
              onChange={handleAmountChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이자율 (%)</label>
            <input 
              type="number" 
              step="0.1" 
              className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.rate} 
              onChange={(e) => setFormData({...formData, rate: e.target.value})} 
              required 
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">거치 기간 (개월)</label>
              <input 
                type="text" 
                inputMode="numeric" 
                className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.grace_period} 
                onChange={(e) => handleNumberChange(e, 'grace_period')} 
                placeholder="0"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">상환 기간 (개월)</label>
              <input 
                type="text" 
                inputMode="numeric" 
                className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.repayment_period} 
                onChange={(e) => handleNumberChange(e, 'repayment_period')} 
                required 
                placeholder="120"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대출 실행일</label>
            <input 
              type="date" 
              className="w-full p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.start_date} 
              onChange={(e) => setFormData({...formData, start_date: e.target.value})} 
              required 
            />
          </div>

          {/* ✅ 하단 버튼: 고정 위치 개선 */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 max-w-[420px] mx-auto">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl text-base active:bg-blue-600 disabled:opacity-50 transition-colors transform active:scale-[0.98]"
            >
              {isLoading ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}