import { Database } from '@/types/supabase';

type Loan = Database['public']['Tables']['loans']['Row'];

// 1. 월 납부액 계산기 (원리금 균등 상환)
export const calculateMonthlyPayment = (amount: number, rate: number, periodMonths: number) => {
  if (amount === 0 || periodMonths === 0) return 0;
  if (rate === 0) return Math.floor(amount / periodMonths); // 무이자일 경우

  const r = rate / 100 / 12; // 월 이자율
  const n = periodMonths;

  // 공식: P * (r(1+r)^n) / ((1+r)^n - 1)
  const monthly = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.floor(monthly);
};

// 2. 대출별 상세 정보 분석기
export const analyzeLoan = (loan: Loan) => {
  const startDate = new Date(loan.start_date);
  
  // 거치 기간 종료일 (상환 시작일)
  const graceEndDate = new Date(startDate);
  graceEndDate.setMonth(graceEndDate.getMonth() + loan.grace_period);

  // 최종 상환 종료일
  const finishDate = new Date(graceEndDate);
  finishDate.setMonth(graceEndDate.getMonth() + loan.repayment_period);

  // 거치 기간 동안 낼 월 이자
  const monthlyInterest = Math.floor((loan.amount * (loan.rate / 100)) / 12);

  // 상환 기간 동안 낼 월 원리금
  const monthlyRepayment = calculateMonthlyPayment(loan.amount, loan.rate, loan.repayment_period);

  return {
    ...loan,
    graceEndDate,
    finishDate,
    monthlyInterest,
    monthlyRepayment,
  };
};