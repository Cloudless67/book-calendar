import React from 'react';

const BookSelectedCard = ({ selectedBook, onReselect }) => {
  if (!selectedBook) return null;

  return (
    <div className="mt-1 flex items-center justify-between p-3 bg-primary-50 rounded-xl border border-primary-100 group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-14 bg-white rounded shadow-sm overflow-hidden flex-shrink-0">
          <img
            src={selectedBook.coverUrl}
            alt={selectedBook.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800 line-clamp-1">{selectedBook.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-500">{selectedBook.author}</p>
            {selectedBook.pageCount > 0 && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                <p className="text-xs font-medium text-primary-600">총 {selectedBook.pageCount}쪽</p>
              </>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={onReselect}
        className="text-xs font-medium text-primary-600 bg-white px-2 py-1.5 rounded-md border border-primary-200 hover:bg-primary-100 transition-colors"
      >
        다시 검색
      </button>
    </div>
  );
};

export default BookSelectedCard;
