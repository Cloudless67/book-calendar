import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Share, PlusSquare, Smartphone, Monitor, CheckCircle2, Download, Sparkles } from 'lucide-react';

const PwaInstallModal = ({ isOpen, onClose, deferredPrompt, onInstallClick }) => {
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true
  );

  const [activeTab, setActiveTab] = useState(isIOS ? 'ios' : isAndroid ? 'android' : 'pc');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-2xl flex flex-col text-left overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-primary-50/50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">BookLog 앱으로 설치하기</h3>
                <p className="text-xs text-slate-500">홈 화면에서 더 빠르고 편리하게 이용하세요</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 md:p-6 space-y-6">
            
            {/* Standalone status banner */}
            {isStandalone ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center gap-3 text-emerald-800">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold">이미 앱으로 실행 중입니다!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">홈 화면에 BookLog가 설치되어 정상 동작 중입니다.</p>
                </div>
              </div>
            ) : deferredPrompt ? (
              /* One-click native install button for Chrome/Android/Desktop */
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-xl shadow-primary-500/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download size={22} />
                    <span className="font-bold text-base">원클릭 바로 설치</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">추천</span>
                </div>
                <p className="text-xs text-primary-100">
                  클릭 한 번으로 홈 화면에 BookLog 앱 아이콘을 추가할 수 있습니다.
                </p>
                <button
                  onClick={onInstallClick}
                  className="w-full py-3 bg-white text-primary-700 font-bold rounded-xl text-sm hover:bg-primary-50 transition-colors shadow-md active:scale-[0.99]"
                >
                  🚀 지금 바로 앱 설치하기
                </button>
              </div>
            ) : null}

            {/* Tab selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">기기별 설치 가이드</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'ios'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Smartphone size={14} />
                  아이폰 (iOS)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'android'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Smartphone size={14} />
                  안드로이드
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pc')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'pc'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Monitor size={14} />
                  PC / 컴퓨터
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            {activeTab === 'ios' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1 text-xs text-slate-700">
                    <p className="font-bold text-slate-800">Safari 하단 공유 버튼 탭</p>
                    <p className="text-slate-500 mt-0.5">
                      Safari 브라우저 하단 중앙의 <Share size={14} className="inline text-primary-600 mx-0.5" /> <strong className="text-slate-800 font-semibold">공유 아이콘</strong>을 누릅니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1 text-xs text-slate-700">
                    <p className="font-bold text-slate-800">'홈 화면에 추가' 선택</p>
                    <p className="text-slate-500 mt-0.5">
                      공유 메뉴를 아래로 스크롤하여 <PlusSquare size={14} className="inline text-slate-700 mx-0.5" /> <strong className="text-slate-800 font-semibold">'홈 화면에 추가'</strong>를 탭합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1 text-xs text-slate-700">
                    <p className="font-bold text-slate-800">우측 상단 '추가' 버튼 클릭</p>
                    <p className="text-slate-500 mt-0.5">
                      오른쪽 상단의 <strong className="text-slate-800 font-semibold">'추가'</strong>를 누르면 바탕화면에 BookLog 앱이 생성됩니다!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'android' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1 text-xs text-slate-700">
                    <p className="font-bold text-slate-800">Chrome 상단 메뉴 [ ⋮ ] 클릭</p>
                    <p className="text-slate-500 mt-0.5">브라우저 오른쪽 상단의 더보기(점 3개) 아이콘을 클릭합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1 text-xs text-slate-700">
                    <p className="font-bold text-slate-800">'앱 설치' 또는 '홈 화면에 추가'</p>
                    <p className="text-slate-500 mt-0.5">
                      메뉴 목록에서 <strong className="text-slate-800 font-semibold">'앱 설치'</strong> 또는 <strong className="text-slate-800 font-semibold">'홈 화면에 추가'</strong> 항목을 탭합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1 text-xs text-slate-700">
                    <p className="font-bold text-slate-800">설치 팝업 확인</p>
                    <p className="text-slate-500 mt-0.5">
                      확인 팝업에서 <strong className="text-slate-800 font-semibold">'설치'</strong>를 누르면 앱처럼 단독 실행이 가능합니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pc' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1 text-xs text-slate-700">
                    <p className="font-bold text-slate-800">주소창 우측 아이콘 클릭</p>
                    <p className="text-slate-500 mt-0.5">
                      Chrome/Edge 브라우저 URL 주소창 맨 우측의 <strong className="text-slate-800 font-semibold">앱 설치 아이콘 [ ⊕ ]</strong>을 클릭합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1 text-xs text-slate-700">
                    <p className="font-bold text-slate-800">'설치' 선택</p>
                    <p className="text-slate-500 mt-0.5">
                      팝업창에서 <strong className="text-slate-800 font-semibold">'설치'</strong>를 클릭하면 데스크톱 작업표시줄 및 시작 메뉴에 등록됩니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-sm"
            >
              닫기
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default PwaInstallModal;
