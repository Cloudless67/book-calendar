import React from 'react';

const DateSelector = ({ isMultiDay, setIsMultiDay, recordDate, setRecordDate, recordEndDate, setRecordEndDate }) => {
  return (
    <div className="flex flex-col gap-3 mt-1">
      <label className="flex items-center gap-3 cursor-pointer group w-fit">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isMultiDay}
            onChange={(e) => setIsMultiDay(e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 shadow-inner"></div>
        </div>
        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
          기간 설정 (여러 날 기록)
        </span>
      </label>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={recordDate}
          onChange={(e) => setRecordDate(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium shadow-sm"
        />
        {isMultiDay && (
          <div className="flex items-center gap-2 animate-in slide-in-from-left-3 fade-in duration-300">
            <span className="text-slate-400 font-medium px-1">~</span>
            <input
              type="date"
              value={recordEndDate}
              onChange={(e) => setRecordEndDate(e.target.value)}
              min={recordDate}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateSelector;
