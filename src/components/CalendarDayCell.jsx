import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

const CalendarDayCell = ({
  day,
  todaysReadings,
  isCurrentMonth,
  isToday,
  isInDragRange,
  isDragStartOrEnd,
  onMouseDown,
  onMouseEnter,
  onOpenModal
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const handleBookClick = (e, reading) => {
    e.stopPropagation();
    if (todaysReadings.length > 1) {
      setShowPicker(true);
    } else {
      onOpenModal(day.toDate(), reading);
    }
  };

  const mainReading = todaysReadings[0];
  const extraCount = todaysReadings.length - 1;

  return (
    <div 
      onMouseDown={(e) => { 
        e.preventDefault(); // 기본 드래그 방지
        onMouseDown(day); 
      }}
      onMouseEnter={() => {
        onMouseEnter(day);
      }}
      className={`
        min-h-[80px] lg:min-h-[100px] border rounded-none lg:rounded-2xl p-1 lg:p-2 transition-all duration-300 relative group cursor-pointer flex flex-col
        ${isInDragRange ? (isDragStartOrEnd ? 'bg-primary-100 border-primary-300 ring-2 ring-primary-400 z-10' : 'bg-primary-50/70 border-primary-200 text-primary-900') : (!isCurrentMonth ? 'opacity-40 bg-slate-50/50 border-transparent' : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-md')}
        ${isToday && !isInDragRange ? 'ring-2 ring-primary-500 border-transparent z-10' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2 shrink-0">
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

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {todaysReadings.length > 0 ? (
          <>
            <div 
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleBookClick(e, mainReading)}
              className="flex flex-col items-center animate-in fade-in zoom-in duration-300 relative group/book hover:scale-105 transition-transform cursor-pointer"
              title={extraCount > 0 ? "여러 권 읽음 (클릭하여 선택)" : "기록 수정하기"}
            >
              <div className="w-8 lg:w-10 h-12 lg:h-14 rounded shadow-sm overflow-hidden border border-slate-200 relative">
                <img 
                  src={mainReading.coverUrl} 
                  alt={mainReading.bookTitle} 
                  className="w-full h-full object-cover"
                />
                {mainReading.status === 'completed' && (
                  <span className="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-amber-500 text-white text-[7px] lg:text-[8px] font-bold px-1 py-0.5 rounded-bl-md shadow-sm z-10">
                    완독
                  </span>
                )}
                {extraCount > 0 && (
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-white font-bold text-xs">+{extraCount}</span>
                  </div>
                )}
              </div>
              {extraCount === 0 && (
                <div className="mt-1 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-primary-500 h-full rounded-full" 
                    style={{ width: `${(mainReading.pagesRead / mainReading.totalPages) * 100}%` }}
                  />
                </div>
              )}
              
              {/* Tooltip for single item */}
              {extraCount === 0 && (
                <div className="absolute opacity-0 group-hover/book:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs rounded-xl p-3 pointer-events-none transition-opacity z-50 shadow-xl">
                  <p className="font-semibold mb-1 line-clamp-1">{mainReading.bookTitle}</p>
                  <p className="text-slate-300">{mainReading.pagesRead}p 읽음 (총 {mainReading.totalPages}p)</p>
                </div>
              )}
            </div>

            {/* Popover for multiple items */}
            {showPicker && (
              <div ref={pickerRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-[60] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-slate-50 px-3 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">기록 수정할 책 선택</span>
                  <span className="text-[10px] font-medium bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-md">총 {todaysReadings.length}권</span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {todaysReadings.map(r => (
                    <button 
                      key={r.id}
                      onClick={(e) => { e.stopPropagation(); setShowPicker(false); onOpenModal(day.toDate(), r); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 group/item"
                    >
                      <div className="w-8 h-12 relative rounded shadow-sm overflow-hidden shrink-0">
                        <img src={r.coverUrl} alt="" className="w-full h-full object-cover" />
                        {r.status === 'completed' && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-bl" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover/item:text-primary-600 transition-colors">{r.bookTitle}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{r.pagesRead}p 읽음 <span className="text-slate-300">/ {r.totalPages}p</span></p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="text-slate-300" size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDayCell;
