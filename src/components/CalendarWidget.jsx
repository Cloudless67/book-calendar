import React, { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { readingsAtom, statsAtom } from '../store';
import ShareModal from './ShareModal';

const CalendarWidget = ({ onOpenModal }) => {
  const readings = useAtomValue(readingsAtom);
  const stats = useAtomValue(statsAtom);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 전역 MouseUp 이벤트를 등록하여 드래그 중 캘린더 밖에서 마우스를 떼더라도 동작하도록 처리
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragStart && dragCurrent) {
        let start = dragStart;
        let end = dragCurrent;
        if (end.isBefore(start)) {
          start = end;
          end = dragStart;
        }
        onOpenModal(start.toDate(), null, end.toDate());
      }
      setDragStart(null);
      setDragCurrent(null);
    };

    if (dragStart) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [dragStart, dragCurrent, onOpenModal]);

  const monthStart = currentDate.startOf('month');
  const monthEnd = monthStart.endOf('month');
  const startDate = monthStart.startOf('week');
  const endDate = monthEnd.endOf('week');

  const dateFormat = "YYYY-MM-DD";
  const days = [];
  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    days.push(current);
    current = current.add(1, 'day');
  }

  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));

  return (
    <div className="glass-card p-4 lg:p-6 lg:h-full flex flex-col">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4 sm:gap-0">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-slate-800">
            {currentDate.format('YYYY년 M월')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">이번 달도 꾸준히 읽어볼까요?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            <span className="hidden lg:inline">공유하기</span>
          </button>
          <button 
            onClick={() => onOpenModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium transition-colors shadow-lg shadow-primary-500/30"
          >
            <Plus size={18} />
            <span>기록하기</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 lg:gap-4 mb-4">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div key={day} className={`text-center text-sm font-medium ${idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-primary-500' : 'text-slate-500'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0 lg:gap-3 flex-1">
        {days.map((day, idx) => {
          const formattedDate = day.format(dateFormat);
          const todaysReadings = readings.filter(r => r.date === formattedDate);
          const isCurrentMonth = day.isSame(monthStart, 'month');
          const isToday = day.isSame(dayjs(), 'day');
          
          let isInDragRange = false;
          let isDragStartOrEnd = false;
          if (dragStart && dragCurrent) {
             const start = dragCurrent.isBefore(dragStart) ? dragCurrent : dragStart;
             const end = dragCurrent.isBefore(dragStart) ? dragStart : dragCurrent;
             if ((day.isAfter(start) || day.isSame(start, 'day')) && (day.isBefore(end) || day.isSame(end, 'day'))) {
                 isInDragRange = true;
             }
             if (day.isSame(start, 'day') || day.isSame(end, 'day')) {
                 isDragStartOrEnd = true;
             }
          }

          return (
            <div 
              key={day.toString()} 
              onMouseDown={(e) => { 
                e.preventDefault(); // 기본 드래그 방지
                setDragStart(day); setDragCurrent(day); 
              }}
              onMouseEnter={() => {
                if (dragStart) setDragCurrent(day);
              }}
              className={`
                min-h-[80px] lg:min-h-[100px] border rounded-none lg:rounded-2xl p-1 lg:p-2 transition-all duration-300 relative group cursor-pointer
                ${isInDragRange ? (isDragStartOrEnd ? 'bg-primary-100 border-primary-300 ring-2 ring-primary-400 z-10' : 'bg-primary-50/70 border-primary-200 text-primary-900') : (!isCurrentMonth ? 'opacity-40 bg-slate-50/50 border-transparent' : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-md')}
                ${isToday && !isInDragRange ? 'ring-2 ring-primary-500 border-transparent z-10' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-primary-500 text-white' : 'text-slate-700'}
                `}>
                  {day.format('D')}
                </span>
                <div className="flex items-center gap-1 z-20">
                  {todaysReadings.length > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onOpenModal(day.toDate()); }}
                      className="opacity-0 lg:group-hover:opacity-100 p-0.5 text-slate-400 hover:text-primary-500 transition-all bg-white hover:bg-primary-50 rounded-full"
                      title="새로운 책 추가"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>

              {todaysReadings.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-1.5 overflow-hidden max-h-[70px]">
                  {todaysReadings.map(reading => (
                    <div 
                      key={reading.id}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); onOpenModal(day.toDate(), reading); }}
                      className="flex flex-col items-center animate-in fade-in zoom-in duration-300 relative group/book hover:scale-105 transition-transform cursor-pointer"
                      title="기록 수정하기"
                    >
                      <div className="w-8 lg:w-10 h-12 lg:h-14 rounded shadow-sm overflow-hidden border border-slate-200 relative">
                        <img 
                          src={reading.coverUrl} 
                          alt={reading.bookTitle} 
                          className="w-full h-full object-cover"
                        />
                        {reading.status === 'completed' && (
                          <span className="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-amber-500 text-white text-[7px] lg:text-[8px] font-bold px-1 py-0.5 rounded-bl-md shadow-sm z-10">
                            완독
                          </span>
                        )}
                      </div>
                      <div className="mt-1 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-primary-500 h-full rounded-full" 
                          style={{ width: `${(reading.pagesRead / reading.totalPages) * 100}%` }}
                        />
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute opacity-0 group-hover/book:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs rounded-xl p-3 pointer-events-none transition-opacity z-50 shadow-xl">
                        <p className="font-semibold mb-1 line-clamp-1">{reading.bookTitle}</p>
                        <p className="text-slate-300">{reading.pagesRead}p 읽음 (총 {reading.totalPages}p)</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="text-slate-300" size={24} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        currentDate={currentDate}
        readings={readings}
        stats={stats}
      />
    </div>
  );
};

export default CalendarWidget;
