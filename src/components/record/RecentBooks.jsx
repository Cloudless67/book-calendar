import React from 'react';

const RecentBooks = ({ searchQuery, recentBooks, handleSelectBook }) => {
  if (searchQuery || recentBooks.length === 0) return null;

  return (
    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <p className="text-xs font-semibold text-slate-500 mb-2">최근 읽은 책에서 선택하기</p>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {recentBooks.map((book, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectBook(book)}
            className="flex flex-col items-center gap-2 w-20 flex-shrink-0 group outline-none"
          >
            <div className="w-16 h-24 rounded-lg overflow-hidden shadow-sm border border-slate-100 group-hover:border-primary-300 group-hover:shadow-md transition-all group-hover:-translate-y-1">
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] font-medium text-slate-700 line-clamp-2 w-full text-center leading-tight group-hover:text-primary-600 transition-colors">
              {book.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentBooks;
