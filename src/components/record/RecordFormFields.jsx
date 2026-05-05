import React from 'react';
import { Book, Clock, Edit3, CheckCircle2, Circle } from 'lucide-react';
import { NumericFormat } from 'react-number-format';

const RecordFormFields = ({
  startPage,
  setStartPage,
  endPage,
  setEndPage,
  readingTime,
  setReadingTime,
  memo,
  setMemo,
  status,
  setStatus,
  totalPages,
  genre,
  setGenre,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pages Read */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Book size={16} className="text-slate-400" /> 페이지 기록
            </span>
            {totalPages > 0 && (
              <span className="text-xs font-normal text-slate-400">전체 {totalPages}쪽</span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <NumericFormat
              placeholder="시작"
              value={startPage}
              onValueChange={(values) => setStartPage(values.value)}
              isAllowed={(values) => {
                const { floatValue } = values;
                if (floatValue === undefined) return true;
                if (floatValue < 0) return false;
                if (totalPages && floatValue > totalPages) return false;
                return true;
              }}
              allowNegative={false}
              decimalScale={0}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none focus:placeholder-transparent transition-all"
            />
            <span className="text-slate-400">~</span>
            <NumericFormat
              placeholder="끝"
              value={endPage}
              onValueChange={(values) => setEndPage(values.value)}
              isAllowed={(values) => {
                const { floatValue } = values;
                if (floatValue === undefined) return true;
                if (floatValue < 0) return false;
                if (totalPages && floatValue > totalPages) return false;
                return true;
              }}
              allowNegative={false}
              decimalScale={0}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none focus:placeholder-transparent transition-all"
            />
            <span className="text-slate-600 font-medium whitespace-nowrap">쪽</span>
          </div>
          {startPage !== '' && endPage !== '' && parseInt(startPage) > parseInt(endPage) && (
            <p className="text-xs text-rose-500 mt-2 font-medium ml-1">끝 페이지는 시작 페이지보다 크거나 같아야 합니다.</p>
          )}
        </div>

        {/* Reading Time */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Clock size={16} className="text-slate-400" /> 독서 시간
          </label>
          <div className="flex items-center gap-2">
            <NumericFormat
              placeholder="예: 45"
              value={readingTime}
              onValueChange={(values) => setReadingTime(values.value)}
              allowNegative={false}
              decimalScale={0}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none focus:placeholder-transparent transition-all"
            />
            <span className="text-slate-600 font-medium whitespace-nowrap">분</span>
          </div>
        </div>
      </div>

      {/* Genre Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Book size={16} className="text-slate-400" /> 도서 장르
        </label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none"
        >
          <option value="" disabled>장르를 선택해주세요 (선택)</option>
          <option value="소설">소설</option>
          <option value="시/에세이">시/에세이</option>
          <option value="인문/교양">인문/교양</option>
          <option value="경제/경영">경제/경영</option>
          <option value="자기계발">자기계발</option>
          <option value="역사">역사</option>
          <option value="과학/IT">과학/IT</option>
          <option value="만화">만화</option>
          <option value="기타">기타</option>
        </select>
      </div>

      {/* Review / Memo */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Edit3 size={16} className="text-slate-400" /> 한 줄 평 및 메모
        </label>
        <textarea
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          placeholder="오늘 읽은 내용 중 기억에 남는 문장이나 느낀 점을 간단히 적어보세요."
        ></textarea>
      </div>

      {/* Status Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setStatus('reading')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
            status === 'reading'
              ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
          }`}
        >
          {status === 'reading' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          계속 읽는 중
        </button>
        <button
          onClick={() => setStatus('completed')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
            status === 'completed'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
          }`}
        >
          {status === 'completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          오늘 완독했어요!
        </button>
      </div>
    </div>
  );
};

export default RecordFormFields;
