import React from 'react';

const RecentBooks = ({ searchQuery, recentBooks, handleSelectBook }) => {
  if (searchQuery || recentBooks.length === 0) return null;

  return (
    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <p className="text-xs font-semibold text-slate-500 mb-2">최근 읽은 책에서 선택하기</p>
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {recentBooks.map((book, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectBook(book)}
            className="flex-shrink-0 px-3.5 py-2 bg-white hover:bg-primary-50 border border-slate-200 hover:border-primary-200 text-slate-700 hover:text-primary-700 rounded-xl text-[11px] font-medium transition-all shadow-sm outline-none"
          >
            {book.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentBooks;
