import Skeleton from 'react-loading-skeleton';

export default function LoanCardSkeleton() {
  return (
    // 실제 카드와 똑같은 외형 컨테이너 (배경, 테두리, 그림자)
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      
      {/* 상단: 제목과 배지 */}
      <div className="flex justify-between items-start mb-3">
        {/* 대출 이름 스켈레톤 */}
        <div className="w-3/5">
           <Skeleton height={24} borderRadius={6} />
        </div>
        
        {/* 이자율 배지 스켈레톤 (약간 둥글게) */}
        <div className="w-12">
           <Skeleton height={24} borderRadius={20} />
        </div>
      </div>
      
      {/* 하단: 금액과 상세정보 */}
      <div className="flex justify-between items-end mt-4">
        <div>
          {/* "대출 잔액" 라벨 */}
          <div className="w-14 mb-1">
             <Skeleton height={14} />
          </div>
          {/* 금액 (크게) */}
          <div className="w-32">
             <Skeleton height={28} borderRadius={8} />
          </div>
        </div>

        <div className="flex flex-col items-end">
          {/* "거치 XX개월..." 텍스트 */}
          <div className="w-24">
             <Skeleton height={14} count={1} />
          </div>
        </div>
      </div>
    </div>
  );
}