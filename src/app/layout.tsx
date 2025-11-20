import type { Metadata } from "next";
import "./globals.css";
import AuthListener from "@/components/layout/AuthListener";
import "react-loading-skeleton/dist/skeleton.css";

export const metadata: Metadata = {
  title: "학자금 대출 관리",
  description: "나의 대출 상환 계획 요약",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 flex justify-center min-h-screen">
        <div className="w-full max-w-[420px] bg-white min-h-screen shadow-lg relative">
          
          {/* 2. 여기에 배치! (보이지 않지만 작동함) */}
          <AuthListener />
          
          {children}
        </div>
      </body>
    </html>
  );
}