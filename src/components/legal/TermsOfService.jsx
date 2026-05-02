import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white md:bg-slate-50/50 pb-20 md:pb-10">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>뒤로가기</span>
        </button>

        <div className="bg-white rounded-3xl md:shadow-sm md:border border-slate-100 p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">서비스 이용약관</h1>
          <p className="text-slate-500 mb-10">마지막 업데이트: 2026년 5월 2일</p>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. 목적</h2>
              <p>본 약관은 BookLog(이하 "서비스")가 제공하는 독서 기록 관리 및 관련 제반 서비스의 이용과 관련하여, 서비스와 회원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. 약관의 게시와 개정</h2>
              <p>서비스는 본 약관의 내용을 사용자가 쉽게 알 수 있도록 서비스 초기 화면이나 연결 화면에 게시합니다. 서비스는 필요 시 관련 법령을 위배하지 않는 범위 내에서 약관을 개정할 수 있습니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. 서비스의 제공 및 변경</h2>
              <p>BookLog는 사용자에게 다음과 같은 서비스를 제공합니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>도서 검색 및 독서 기록 저장</li>
                <li>독서 시간 및 통계 시각화</li>
                <li>연속 독서 일수(스트릭) 관리</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. 회원의 의무</h2>
              <p>회원은 서비스를 이용할 때 다음 각 호의 행위를 하여서는 안 됩니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>타인의 정보를 도용하거나 부정하게 사용하는 행위</li>
                <li>서비스의 운영을 방해하거나 안정적 운영을 저해하는 행위</li>
                <li>기타 불법적이거나 부당한 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. 서비스의 중단</h2>
              <p>서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. 면책조항</h2>
              <p>서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다. 또한, 사용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
