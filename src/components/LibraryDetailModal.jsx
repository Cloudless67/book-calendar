import React, { useState, useEffect } from 'react';
import { X, BookOpen, Quote, Save, Plus, Trash2, Star } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { updateReadingAtom, deleteReadingAtom } from '../store';
import dayjs from 'dayjs';

const LibraryDetailModal = ({ isOpen, onClose, record, onContinueRecording }) => {
  const updateReading = useSetAtom(updateReadingAtom);
  const deleteReading = useSetAtom(deleteReadingAtom);
  
  const [memo, setMemo] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState('');
  const [newQuotePage, setNewQuotePage] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (isOpen && record) {
      setMemo(record.memo || '');
      setQuotes(record.quotes || []);
      setNewQuote('');
      setNewQuotePage('');
      setRating(record.rating || 0);
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const handleSave = () => {
    const updatedRecord = {
      ...record,
      memo,
      quotes,
      rating
    };
    updateReading(updatedRecord);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 독서 기록을 삭제하시겠습니까?')) {
      deleteReading(record.id);
      onClose();
    }
  };

  const handleAddQuote = () => {
    if (!newQuote.trim()) return;
    setQuotes([...quotes, { 
      id: Date.now().toString(), 
      text: newQuote, 
      page: newQuotePage 
    }]);
    setNewQuote('');
    setNewQuotePage('');
  };

  const handleRemoveQuote = (id) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const readCount = record.endPage !== undefined && record.endPage !== null ? record.endPage : (record.pagesRead || 0);
  const progress = Math.min(Math.round((readCount / (record.totalPages || 1)) * 100), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-50 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary-50 p-2 rounded-xl text-primary-600">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">서재 상세</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          
          {/* Left Column (Book Metadata) */}
          <div className="md:w-80 bg-white border-r border-slate-100 p-6 md:p-8 shrink-0 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-32 md:w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-6 mx-auto md:mx-0">
              <img src={record.coverUrl} alt={record.bookTitle} className="w-full h-full object-cover" />
            </div>
            
            <div className="w-full">
              {record.status === 'completed' && (
                <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md mb-3">
                  완독의 기쁨! 🎉
                </span>
              )}
              
              <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2">{record.bookTitle}</h3>
              <p className="text-slate-500 text-sm mb-4">{record.author}</p>

              <div className="flex items-center gap-1 mb-6 justify-center md:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 outline-none"
                  >
                    <Star 
                      size={24} 
                      className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} transition-colors`} 
                    />
                  </button>
                ))}
              </div>
              
              <div className="space-y-4 w-full">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-medium text-slate-500">진행률</span>
                    <span className="text-lg font-bold text-slate-700">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                    <div className="bg-primary-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-right text-slate-500">
                    {record.startPage !== undefined && record.startPage !== null && record.endPage !== undefined && record.endPage !== null
                      ? `${record.startPage} ~ ${record.endPage}`
                      : record.pagesRead} / {record.totalPages} 쪽
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <span className="block text-xs font-medium text-slate-500 mb-1">기록일</span>
                     <span className="block text-sm font-semibold text-slate-700">{dayjs(record.date).format('YYYY.MM.DD')}</span>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <span className="block text-xs font-medium text-slate-500 mb-1">독서 시간</span>
                     <span className="block text-sm font-semibold text-slate-700">{record.readingTime || 0}분</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Memo & Quotes) */}
          <div className="flex-1 p-6 md:p-8 space-y-8 bg-slate-50/50">
            
            {/* Memo Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg"><BookOpen size={16} /></div>
                <h3 className="text-base font-bold text-slate-800">나만의 메모</h3>
              </div>
              <textarea 
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="책을 읽고 느낀 점, 요약 등을 자유롭게 남겨보세요."
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 md:p-5 h-32 resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 text-sm leading-relaxed"
              />
            </section>

            {/* Quotes Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg"><Quote size={16} /></div>
                <h3 className="text-base font-bold text-slate-800">기억하고 싶은 문장</h3>
              </div>
              
              <div className="space-y-3 mb-4">
                {quotes.length === 0 ? (
                  <div className="text-center py-6 bg-white border border-slate-100 border-dashed rounded-2xl text-slate-400 text-sm">
                    아직 수집한 문장이 없습니다.
                  </div>
                ) : (
                  quotes.map(q => (
                    <div key={q.id} className="group flex justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-2xl"></div>
                      <div className="flex-1 pl-2">
                        <p className="text-slate-700 text-sm leading-relaxed mb-2">"{q.text}"</p>
                        {q.page && <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">p. {q.page}</span>}
                      </div>
                      <button 
                        onClick={() => handleRemoveQuote(q.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all self-start ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Quote Input */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
                <input 
                  type="number"
                  value={newQuotePage}
                  onChange={(e) => setNewQuotePage(e.target.value)}
                  placeholder="쪽수"
                  className="w-full sm:w-24 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuote()}
                    placeholder="인상 깊은 문장을 입력하세요"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-3 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                  <button 
                    onClick={handleAddQuote}
                    disabled={!newQuote.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-ambient-100 text-amber-500 hover:bg-amber-100 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 md:py-5 border-t border-slate-100 flex justify-between shrink-0 rounded-b-3xl">
          <button 
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl text-rose-500 font-medium hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-sm"
          >
            <Trash2 size={16} />
            삭제
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                if (onContinueRecording) {
                  onContinueRecording({
                    title: record.bookTitle,
                    author: record.author,
                    coverUrl: record.coverUrl,
                    pageCount: record.totalPages,
                    isbn: record.isbn || ''
                  });
                }
              }}
              className="px-5 py-2.5 rounded-xl text-primary-600 bg-primary-50 font-medium hover:bg-primary-100 transition-colors text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              이어서 기록하기
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors text-sm"
            >
              닫기
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-lg shadow-slate-200"
            >
              <Save size={16} />
              상세 기록 저장
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LibraryDetailModal;
