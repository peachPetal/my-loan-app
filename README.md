# 🎓 학자금 대출 관리 서비스 (My Student Loan)

한국장학재단 학자금 대출 정보를 입력하여 **총 대출 잔액, 이자 및 원금 상환 일정**을 한눈에 요약해 주는 모바일 웹 서비스입니다.

## 📌 주요 기능

* **간편 로그인:** Google 계정으로 빠르게 시작 (Supabase Auth)
* **대출 관리:** 학기별 생활비/등록금 대출 정보 입력 (금액, 이율, 거치/상환 기간)
* **상환 요약:** 복잡한 대출 정보를 분석하여 "20XX년부터 월 XXX원 상환" 형태의 쉬운 문장으로 요약
* **시각화:** 남은 거치 기간과 상환 시작일을 직관적인 카드로 표시

## 🛠 기술 스택 (Tech Stack)

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Backend & Auth:** Supabase (PostgreSQL)
* **Deployment:** Vercel

## 🚀 시작하기 (Getting Started)

이 프로젝트를 로컬에서 실행하려면 다음 단계가 필요합니다.

### 1. 저장소 복제 (Clone)

```bash
git clone [https://github.com/peachPetal/my-loan-app.git](https://github.com/peachPetal/my-loan-app.git)
cd my-loan-app
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정 (.env.local)

프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 키를 입력하세요.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

---

## 🗄️ 데이터베이스 스키마 (Supabase)

Supabase SQL Editor에서 아래 쿼리를 실행하여 테이블을 생성해주세요.

```sql
-- 대출 정보 테이블
create table loans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,           -- 대출 명칭 (예: 2023 1학기)
  amount bigint not null,       -- 대출 원금
  rate numeric not null,        -- 이자율
  grace_period int not null,    -- 거치 기간 (개월)
  repayment_period int not null,-- 상환 기간 (개월)
  start_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 정책 (보안)
alter table loans enable row level security;

create policy "Users can view their own loans" on loans for select using (auth.uid() = user_id);
create policy "Users can insert their own loans" on loans for insert with check (auth.uid() = user_id);
create policy "Users can update their own loans" on loans for update using (auth.uid() = user_id);
create policy "Users can delete their own loans" on loans for delete using (auth.uid() = user_id);
```

## 📱 모바일 최적화 가이드

이 프로젝트는 **iPhone 12 Mini (360~375px)** 해상도를 기준으로 최적화되었습니다.
데스크톱 브라우저에서 확인 시 모바일 뷰포트 중앙 정렬 레이아웃이 적용됩니다.

## 📝 License

MIT License