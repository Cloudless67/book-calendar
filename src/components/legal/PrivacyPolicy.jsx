import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">개인정보 처리방침</h1>
          <p className="text-slate-500 mb-10">마지막 업데이트: 2026년 5월 2일</p>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. 수집하는 개인정보 항목</h2>
              <p className="mb-2">BookLog는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>로그인 정보: 이메일, 별명, 프로필 이미지 (소셜 로그인 제공자로부터 제공받음)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. 개인정보의 수집 및 이용 목적</h2>
              <p>수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>사용자 식별: 회원제 서비스 이용에 따른 본인 확인 및 부정 이용 방지</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
              <p>원칙적으로, 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 사용자가 서비스를 이용하는 동안에는 독서 기록 보존을 위해 정보를 유지하며, 계정 탈퇴 시 즉시 삭제 처리됩니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. 개인정보의 제3자 제공</h2>
              <p>BookLog는 사용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 사용자가 직접 동의한 경우나 법령의 규정에 의거한 경우에는 예외로 합니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. 이용자의 권리와 그 행사 방법</h2>
              <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 서비스 탈퇴를 통해 개인정보 이용에 대한 동의를 철회할 수 있습니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. 개인정보 보호책임자</h2>
              <p>서비스 이용 중 발생하는 모든 개인정보 보호 관련 민원은 개발자에게 문의해 주시기 바랍니다.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
