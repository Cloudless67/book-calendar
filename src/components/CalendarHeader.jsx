import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const CalendarHeader = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onOpenShareModal,
  onOpenRecordModal
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4 sm:gap-0">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-slate-800">
          {currentDate.format('YYYY년 M월')}
        </h2>
        <p className="text-sm text-slate-500 mt-1">이번 달도 꾸준히 읽어볼까요?</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button onClick={onPrevMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <button onClick={onNextMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
        <button 
          onClick={onOpenShareModal}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          <span className="hidden lg:inline">공유하기</span>
        </button>
        <button 
          onClick={onOpenRecordModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium transition-colors shadow-lg shadow-primary-500/30"
        >
          <Plus size={18} />
          <span>기록하기</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
