import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import dayjs from 'dayjs';

const ShareModal = ({ isOpen, onClose, currentDate, readings, stats }) => {
  const shareRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

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

  const monthStart = currentDate.startOf('month');
  const monthEnd = monthStart.endOf('month');
  const startDate = monthStart.startOf('week');
  const endDate = monthEnd.endOf('week');

  const days = [];
  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    days.push(current);
    current = current.add(1, 'day');
  }

  // Calculate month stats
  const currentMonthReadings = readings.filter(r => dayjs(r.date).isSame(currentDate, 'month'));
  const completedBooks = new Set(currentMonthReadings.filter(r => r.status === 'completed').map(r => r.bookTitle)).size;
  const totalPages = currentMonthReadings.reduce((sum, r) => {
    const delta = (r.endPage !== undefined && r.startPage !== undefined) 
                  ? (parseInt(r.endPage) || 0) - (parseInt(r.startPage) || 0)
                  : (parseInt(r.pagesRead) || 0);
    return sum + Math.max(0, delta);
  }, 0);
  
  // Simple streak calculation (consecutive days reading up to today in this month)
  let streak = 0;
  let checkDate = dayjs();
  while(checkDate.isAfter(monthStart) || checkDate.isSame(monthStart, 'day')) {
    const formatted = checkDate.format('YYYY-MM-DD');
    if (readings.some(r => r.date === formatted)) {
      streak++;
      checkDate = checkDate.subtract(1, 'day');
    } else {
      break;
    }
  }

  const handleDownload = async () => {
    if (!shareRef.current) return;
    try {
      setIsCapturing(true);
      const dataUrl = await toPng(shareRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff' // Ensure background is white in case of transparency issues
      });
      
      const link = document.createElement('a');
      link.download = `booklog-${currentDate.format('YYYY-MM')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image', error);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative w-full max-w-[520px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col text-left my-4 sm:my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">이달의 독서 기록 공유</h3>
            <p className="text-sm text-slate-500">인스타그램 피드에 최적화된 사이즈입니다</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Share Preview Area */}
        <div className="p-4 md:p-6 flex justify-center bg-slate-100/50">
          {/* The actual element to be captured */}
          <div 
            ref={shareRef}
            className="w-full max-w-[480px] aspect-[4/5] bg-white rounded-3xl shadow-xl flex flex-col justify-between border border-slate-100 overflow-hidden relative p-6 md:p-8 shrink-0"
          >
            <header className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">📚</span>
                <h1 className="text-xl font-black text-slate-950 tracking-tighter">Book<span className="text-primary-600">Log</span></h1>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-950">{currentDate.format('YYYY년 M월')}</p>
                <p className="text-xs text-slate-500 font-medium">나의 독서 여정</p>
              </div>
            </header>

            <section className="flex-grow flex items-center justify-center">
              <div className="grid grid-cols-7 gap-1.5 md:gap-2.5 w-full">
                {days.map((day, i) => {
                  const isCurrentMonth = day.isSame(currentDate, 'month');
                  const isToday = day.isSame(dayjs(), 'day');
                  const dayReadings = readings.filter(r => r.date === day.format('YYYY-MM-DD'));
                  const completed = dayReadings.some(r => r.status === 'completed');
                  const coverUrl = dayReadings.length > 0 ? dayReadings[0].coverUrl : null;

                  const dayNumber = day.format('D');

                  if (!isCurrentMonth) {
                    return <div key={i} className="aspect-square bg-slate-50 rounded-xl border border-slate-100"></div>;
                  }

                  if (coverUrl) {
                    const proxiedCoverUrl = `/image-proxy?url=${encodeURIComponent(coverUrl)}`;
                    return (
                      <div 
                        key={i} 
                        className="aspect-square bg-cover bg-center rounded-xl relative shadow-inner overflow-hidden"
                        style={{ backgroundImage: `url(${proxiedCoverUrl})`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}
                      >
                        <span className="absolute top-1 left-1.5 text-[9px] md:text-[10px] font-bold text-white drop-shadow-md z-20">
                          {dayNumber}
                        </span>
                        {completed && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-br from-primary-400 to-primary-600 text-white text-[8px] md:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md tracking-tighter z-30">
                            FINISH
                          </span>
                        )}
                        {!completed && <div className="absolute inset-0 bg-white/20 rounded-xl z-10" />}
                      </div>
                    );
                  }

                  if (isToday) {
                    return (
                      <div key={i} className="aspect-square bg-white rounded-xl border-2 border-dashed border-primary-300 flex items-center justify-center relative">
                        <span className="absolute top-0.5 left-1.5 text-[9px] md:text-[10px] font-bold text-primary-500">
                          {dayNumber}
                        </span>
                        <span className="text-primary-500 text-[10px] md:text-xs font-bold scale-75 md:scale-100">TODAY</span>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className="aspect-square bg-slate-100 rounded-xl relative">
                      <span className="absolute top-1 left-1.5 text-[9px] md:text-[10px] font-medium text-slate-400">
                        {dayNumber}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <footer className="mt-8 pt-6 border-t border-slate-100 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium">완독</p>
                    <p className="text-lg md:text-xl font-extrabold text-slate-950">{completedBooks}<span className="text-xs md:text-sm text-slate-400 font-normal">권</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium">총 페이지</p>
                    <p className="text-lg md:text-xl font-extrabold text-slate-950">{totalPages}<span className="text-xs md:text-sm text-slate-400 font-normal">p</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium">연속</p>
                    <p className="text-lg md:text-xl font-extrabold text-primary-600">{streak}<span className="text-xs md:text-sm text-primary-300 font-normal">일</span></p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-[8px] md:text-[10px] text-slate-300">책 읽는 습관을 시각적으로 관리하세요.</p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-tighter">booklog.io</p>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleDownload}
            disabled={isCapturing}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCapturing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download size={18} />
                이미지 저장
              </>
            )}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
