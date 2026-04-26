import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import { readingsAtom } from '../store';
import { BookOpen, CheckCircle2, Circle } from 'lucide-react';
import LibraryDetailModal from './LibraryDetailModal';

const LibraryView = ({ onOpenModal }) => {
  const readings = useAtomValue(readingsAtom);
  const [filter, setFilter] = useState('all'); // all | reading | completed
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 중복 책들을 id 기준이 아닌 책 제목 기준으로 묶어서 고유하게 보여주고 싶을 수 있지만, 여기서는 개별 독서 기록 기준으로 나열합니다.
  const filteredReadings = readings.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <p className="text-sm font-medium text-primary-600 mb-1">나만의 독서 공간</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">내 서재</h1>
        </div>
        
        {/* 필터 탭 */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${filter === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            전체도서
          </button>
          <button 
            onClick={() => setFilter('reading')}
            className={`whitespace-nowrap flex-1 md:flex-none justify-center px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${filter === 'reading' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Circle size={14} className={filter === 'reading' ? 'text-primary-500' : ''} /> 읽는 중
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`whitespace-nowrap flex-1 md:flex-none justify-center px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${filter === 'completed' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CheckCircle2 size={14} className={filter === 'completed' ? 'text-emerald-500' : ''} /> 완독
          </button>
        </div>
      </header>

      {filteredReadings.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-32 mt-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-slate-400" />
          </div>
          <p className="text-lg font-medium text-slate-700">서재가 비어있어요.</p>
          <p className="text-sm text-slate-500 mt-1">캘린더에서 새 책을 기록해 보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-4">
          {filteredReadings.map(book => {
             // 진행률 계산
             const readCount = book.endPage !== undefined && book.endPage !== null ? book.endPage : (book.pagesRead || 0);
             const progress = Math.min(Math.round((readCount / (book.totalPages || 1)) * 100), 100);
             return (
              <div 
                key={book.id} 
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedRecord(book);
                  setIsModalOpen(true);
                }}
              >
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 mb-3">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  
                  {/* 오버레이 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                     <p className="text-white text-xs font-medium line-clamp-2">{book.memo || "기록된 메모가 없습니다."}</p>
                  </div>
                  
                  {/* 상태 뱃지 */}
                  {book.status === 'completed' && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                      완독
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">{book.bookTitle}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{book.author}</p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${book.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-500'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 w-7 text-right">{progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LibraryDetailModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onContinueRecording={(book) => {
          setIsModalOpen(false);
          setSelectedRecord(null);
          if (onOpenModal) {
            onOpenModal(new Date(), null, null, book);
          }
        }}
      />
    </div>
  );
};

export default LibraryView;
