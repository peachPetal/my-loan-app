import Link from 'next/link'; // Link import 필수
import { Database } from '@/types/supabase';

type Loan = Database['public']['Tables']['loans']['Row'];

interface LoanCardProps {
  loan: Loan;
}

export default function LoanCard({ loan }: LoanCardProps) {
  return (
    // div를 Link로 감싸서 클릭 시 이동하게 함
    <Link href={`/edit/${loan.id}`} className="block">
      <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer hover:border-blue-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800 text-lg">{loan.name}</h3>
          <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
            {loan.rate}%
          </span>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-400 text-xs mb-1">대출 잔액</p>
            <p className="text-xl font-bold text-gray-900">
              {loan.amount.toLocaleString()}원
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">
              {loan.grace_period > 0 ? `거치 ${loan.grace_period}개월` : '거치 없음'}
               {' · '}
              상환 {loan.repayment_period}개월
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}