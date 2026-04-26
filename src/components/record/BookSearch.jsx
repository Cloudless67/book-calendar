import React from 'react';
import { Search, Loader2 } from 'lucide-react';

const BookSearch = ({
  searchType,
  setSearchType,
  searchQuery,
  setSearchQuery,
  setSearchPage,
  isSearching,
  showDropdown,
  searchResults,
  totalSearchResults,
  searchPage,
  handleSelectBook,
  isProcessingSelection,
}) => {
  const searchTypes = [
    { id: 'kwd', label: '전체' },
    { id: 'title', label: '제목' },
    { id: 'author', label: '저자' },
    { id: 'isbn', label: 'ISBN' },
  ];

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Search Type Tabs */}
      <div className="flex gap-2">
        {searchTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => {
              setSearchType(type.id);
              setSearchPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              searchType === type.id
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-slate-700"
          placeholder="네이버 도서 검색 API로 책 제목 검색..."
        />

        {/* Search Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col">
            <div className="max-h-64 overflow-y-auto relative">
              {isSearching ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="animate-spin text-primary-500" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelectBook(book)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors text-left disabled:opacity-50"
                    disabled={isProcessingSelection}
                  >
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-8 h-12 object-cover rounded shadow-sm"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 truncate">{book.title}</p>
                      <p className="text-xs text-slate-500 truncate">{book.author}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">검색 결과가 없습니다.</div>
              )}

              {isProcessingSelection && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary-500 h-6 w-6" />
                </div>
              )}
            </div>

            {/* Pagination */}
            {!isSearching && totalSearchResults > 10 && (
              <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                  disabled={searchPage === 1}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  이전
                </button>
                <span className="text-xs text-slate-500 font-medium">
                  {searchPage} <span className="text-slate-300">/</span>{' '}
                  {Math.ceil(totalSearchResults / 10)} 페이지
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSearchPage((p) => Math.min(Math.ceil(totalSearchResults / 10), p + 1))
                  }
                  disabled={searchPage >= Math.ceil(totalSearchResults / 10)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSearch;
