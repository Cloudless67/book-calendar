import React, { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import { useAtomValue } from 'jotai';
import { readingsAtom, statsAtom } from '../store';
import ShareModal from './ShareModal';
import CalendarHeader from './CalendarHeader';
import CalendarDayCell from './CalendarDayCell';

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

  const handleMouseDown = (day) => {
    setDragStart(day);
    setDragCurrent(day);
  };

  const handleMouseEnter = (day) => {
    if (dragStart) setDragCurrent(day);
  };

  return (
    <div className="glass-card p-4 lg:p-6 lg:h-full flex flex-col">
      <CalendarHeader 
        currentDate={currentDate}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenRecordModal={() => onOpenModal()}
      />

      <div className="grid grid-cols-7 gap-0 lg:gap-4 mb-4">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div key={day} className={`text-center text-sm font-medium ${idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-primary-500' : 'text-slate-500'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0 lg:gap-3 flex-1">
        {days.map((day) => {
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
            <CalendarDayCell 
              key={day.toString()}
              day={day}
              todaysReadings={todaysReadings}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isInDragRange={isInDragRange}
              isDragStartOrEnd={isDragStartOrEnd}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onOpenModal={onOpenModal}
            />
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
