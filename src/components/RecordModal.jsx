import React, { useState, useEffect } from 'react';
import { X, Search, Book, Clock, Edit3, CheckCircle2, Circle, Loader2, Trash2, CalendarRange } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import { useSetAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';
import { addReadingAtom, updateReadingAtom, deleteReadingAtom } from '../store';
import { supabase } from '../lib/supabase';

// 환경변수에서 API 키 로드
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET;
const SEOJI_API_KEY = import.meta.env.VITE_SEOJI_API_KEY;

const RecordModal = ({ isOpen, onClose, initialDate, initialEndDate, initialRecord }) => {
  const addReading = useSetAtom(addReadingAtom);
  const updateReading = useSetAtom(updateReadingAtom);
  const deleteReading = useSetAtom(deleteReadingAtom);

  const [status, setStatus] = useState('reading');
  const [searchType, setSearchType] = useState('kwd'); // kwd, title, author, isbn
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [recordDate, setRecordDate] = useState('');
  const [recordEndDate, setRecordEndDate] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);

  // Form states
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [memo, setMemo] = useState('');

  // Reset form when opened with new date
  useEffect(() => {
    if (isOpen) {
      if (initialRecord) {
        setStatus(initialRecord.status || 'reading');
        setSearchType('kwd');
        setSearchQuery('');
        setSearchPage(1);
        setSelectedBook({
          title: initialRecord.bookTitle,
          author: initialRecord.author,
          coverUrl: initialRecord.coverUrl,
          pageCount: initialRecord.totalPages
        });
        setStartPage('');
        setEndPage(initialRecord.pagesRead ? initialRecord.pagesRead.toString() : '');
        setReadingTime(initialRecord.readingTime ? initialRecord.readingTime.toString() : '');
        setMemo(initialRecord.memo || '');
        setRecordDate(initialRecord.date);
        setRecordEndDate(initialRecord.date);
        setIsMultiDay(false);
      } else {
        setStatus('reading');
        setSearchType('kwd');
        setSearchQuery('');
        setSearchPage(1);
        setSelectedBook(null);
        setStartPage('');
        setEndPage('');
        setReadingTime('');
        setMemo('');
        
        const d = initialDate ? dayjs(initialDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
        const endD = initialEndDate ? dayjs(initialEndDate).format('YYYY-MM-DD') : d;
        setRecordDate(d);
        setRecordEndDate(endD);
        setIsMultiDay(endD !== d);
      }
    }
  }, [isOpen, initialRecord]);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle dropdown visibility
  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [debouncedQuery]);

  // React Query for Naver Book Search
  const { data: queryData, isFetching: isSearching } = useQuery({
    queryKey: ['naverSearch', searchType, debouncedQuery, searchPage],
    queryFn: async () => {
      if (debouncedQuery.trim().length < 2) return { items: [], total: 0 };
      
      const searchParams = new URLSearchParams({
        display: 10,
        start: ((searchPage - 1) * 10) + 1,
        sort: 'sim'
      });

      let endpoint = '/naver-api/v1/search/book.json';
      
      if (searchType === 'kwd') {
         searchParams.append('query', debouncedQuery);
      } else {
         endpoint = '/naver-api/v1/search/book_adv.json';
         if (searchType === 'title') searchParams.append('d_titl', debouncedQuery);
         if (searchType === 'author') searchParams.append('d_auth', debouncedQuery);
         if (searchType === 'isbn') searchParams.append('d_isbn', debouncedQuery);
      }
      
      const res = await fetch(`${endpoint}?${searchParams.toString()}`, {
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID || '',
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET || ''
        }
      });
      
      if (!res.ok) throw new Error(`Naver API error: ${res.status}`);
      
      const jsonData = await res.json();
      const parsedResults = (jsonData.items || []).map((item, index) => {
        const rawTitle = item.title || '제목 없음';
        const rawAuthor = item.author || '작자 미상';
        return {
          id: `naver-${index}-${Date.now()}`,
          title: rawTitle.replace(/<[^>]*>?/gm, ''),
          author: rawAuthor.replace(/<[^>]*>?/gm, ''),
          coverUrl: item.image || 'https://via.placeholder.com/128x192.png?text=No+Cover',
          isbn: item.isbn || '', 
          pageCount: 300
        };
      });

      return {
        items: parsedResults,
        total: parseInt(jsonData.total || 0)
      };
    },
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const searchResults = queryData?.items || [];
  const totalSearchResults = queryData?.total || 0;

  const handleSelectBook = async (book) => {
    setShowDropdown(false);
    setIsProcessingSelection(true);
    let finalBook = { ...book };

    try {
      if (book.isbn) {
        const cleanIsbn = book.isbn.replace(/[^0-9X\s]/gi, '').split(' ')[0].substring(0, 13);
        
        if (cleanIsbn) {
          // 1. Supabase DB에서 캐시된 책 메타데이터 확인
          const { data: cachedBook, error: cacheError } = await supabase
            .from('books')
            .select('*')
            .eq('isbn', cleanIsbn)
            .single();

          if (cachedBook) {
            // 캐시 데이터가 있으면 바로 사용 (API 절약)
            finalBook = {
              ...finalBook,
              title: cachedBook.title || finalBook.title,
              author: cachedBook.author || finalBook.author,
              coverUrl: cachedBook.cover_url || finalBook.coverUrl,
              pageCount: cachedBook.total_pages > 0 ? cachedBook.total_pages : finalBook.pageCount
            };
          } else {
            // 2. 캐시 데이터가 없으면 국립중앙도서관(서지) API 호출
            const searchParams = new URLSearchParams({
              cert_key: SEOJI_API_KEY,
              result_style: 'json',
              page_no: 1,
              page_size: 10,
              isbn: cleanIsbn
            });
            
            const endpoint = `/nl-api/seoji/SearchApi.do?${searchParams.toString()}`;
            const res = await fetch(endpoint);
            
            if (res.ok) {
              const data = await res.json();
              const items = data.docs || []; 
              if (items.length > 0) {
                 const detail = items[0];
                 const parsedPages = parseInt(detail.PAGE) || 0;
                 finalBook.title = detail.TITLE || finalBook.title;
                 finalBook.author = detail.AUTHOR || finalBook.author;
                 // 서지 API 이미지는 품질이 안 좋을 수 있으니 네이버 우선
                 finalBook.pageCount = parsedPages > 0 ? parsedPages : finalBook.pageCount;
              }
            }

            // 3. 네이버 썸네일 이미지를 다운로드하여 Supabase Storage에 영구 저장 (CDN)
            let supabaseImageUrl = finalBook.coverUrl;
            if (finalBook.coverUrl && finalBook.coverUrl.includes('pstatic.net')) {
              try {
                // 프록시를 통해 이미지 Blob 가져오기 (CORS 회피)
                const imgRes = await fetch(`/image-proxy?url=${encodeURIComponent(finalBook.coverUrl)}`);
                const imgBlob = await imgRes.blob();
                const fileExt = imgBlob.type.split('/')[1] || 'jpg';
                const fileName = `${cleanIsbn}.${fileExt}`;

                // Supabase Storage에 업로드
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('book-covers')
                  .upload(fileName, imgBlob, { upsert: true });

                if (!uploadError) {
                  const { data: publicUrlData } = supabase.storage
                    .from('book-covers')
                    .getPublicUrl(fileName);
                  supabaseImageUrl = publicUrlData.publicUrl;
                  finalBook.coverUrl = supabaseImageUrl;
                }
              } catch (e) {
                console.warn('Failed to upload image to Supabase, using original Naver URL', e);
              }
            }

            // 4. 새로운 책 정보를 DB에 캐싱
            await supabase.from('books').insert({
              isbn: cleanIsbn,
              title: finalBook.title,
              author: finalBook.author,
              cover_url: supabaseImageUrl,
              total_pages: finalBook.pageCount
            });
          }
        }
      }
    } catch (err) {
      console.error('Book selection processing failed:', err);
    }

    setSearchQuery('');
    setSelectedBook(finalBook);
    setEndPage(finalBook.pageCount ? finalBook.pageCount.toString() : '');
    setIsProcessingSelection(false);
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 독서 기록을 삭제하시겠습니까?")) {
      deleteReading(initialRecord.id);
      onClose();
    }
  };

  const handleSave = () => {
    if (!selectedBook) {
      alert("책을 선택해주세요.");
      return;
    }

    const sPage = parseInt(startPage) || 0;
    const ePage = parseInt(endPage) || 0;
    const pagesReadAmount = ePage > sPage ? ePage - sPage : ePage;

    if (initialRecord) {
      const newReading = {
        id: initialRecord.id,
        bookTitle: selectedBook.title,
        author: selectedBook.author,
        coverUrl: selectedBook.coverUrl,
        date: recordDate,
        pagesRead: pagesReadAmount,
        totalPages: selectedBook.pageCount || ePage || 300,
        status: status,
        memo: memo,
        readingTime: parseInt(readingTime) || 0,
        rating: status === 'completed' ? 5 : (initialRecord.rating || 0)
      };
      updateReading(newReading);
    } else {
      let datesToRecord = [recordDate];
      if (isMultiDay && dayjs(recordEndDate).isValid() && dayjs(recordEndDate).isAfter(dayjs(recordDate))) {
        datesToRecord = [];
        let curr = dayjs(recordDate);
        const end = dayjs(recordEndDate);
        while(curr.isBefore(end) || curr.isSame(end, 'day')) {
          datesToRecord.push(curr.format('YYYY-MM-DD'));
          curr = curr.add(1, 'day');
        }
      }

      const dailyPages = Math.floor(pagesReadAmount / datesToRecord.length);
      const remainderPages = pagesReadAmount % datesToRecord.length;
      const dailyTime = Math.floor((parseInt(readingTime) || 0) / datesToRecord.length);

      const readingsToInsert = datesToRecord.map((d, index) => {
         const isLastDay = index === datesToRecord.length - 1;
         const pRead = dailyPages + (isLastDay ? remainderPages : 0);
         const cStatus = isLastDay ? status : 'reading';
         
         return {
          bookTitle: selectedBook.title,
          author: selectedBook.author,
          coverUrl: selectedBook.coverUrl,
          date: d,
          pagesRead: pRead,
          totalPages: selectedBook.pageCount || ePage || 300,
          status: cStatus,
          memo: memo,
          readingTime: dailyTime,
          rating: cStatus === 'completed' ? 5 : 0
         };
      });

      addReading(readingsToInsert);
    }
    onClose();
  };

  // Prevent body scroll when modal is open
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg text-left overflow-visible animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8">
          
          {/* Header */}
          <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex flex-col gap-3 rounded-t-3xl">
            <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{initialRecord ? '독서 기록 수정하기' : '독서 기록하기'}</h2>
              {initialRecord && (
                 <p className="text-sm text-slate-500 mt-1">
                   {dayjs(recordDate).format('YYYY년 M월 D일 (dddd)')}의 기록을 수정합니다.
                 </p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200/50 text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Date Selector for New Records */}
          {!initialRecord && (
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
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">기간 설정 (여러 날 기록)</span>
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
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Book Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">어떤 책을 읽으셨나요?</label>
            </div>
            {!selectedBook ? (
              <div className="flex flex-col gap-2 relative">
                {/* Search Type Tabs */}
                <div className="flex gap-2">
                  {[
                    { id: 'kwd', label: '전체' },
                    { id: 'title', label: '제목' },
                    { id: 'author', label: '저자' },
                    { id: 'isbn', label: 'ISBN' }
                  ].map(type => (
                    <button 
                      key={type.id}
                      type="button"
                      onClick={() => { setSearchType(type.id); setSearchPage(1); }}
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
                  {isSearching ? <Loader2 className="h-5 w-5 text-primary-500 animate-spin" /> : <Search className="h-5 w-5 text-slate-400" />}
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
                        <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>
                      ) : searchResults.length > 0 ? searchResults.map(book => (
                        <button 
                          key={book.id}
                          type="button"
                          onClick={() => handleSelectBook(book)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors text-left disabled:opacity-50"
                          disabled={isProcessingSelection}
                        >
                          <img src={book.coverUrl} alt={book.title} className="w-8 h-12 object-cover rounded shadow-sm" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{book.title}</p>
                            <p className="text-xs text-slate-500 truncate">{book.author}</p>
                          </div>
                        </button>
                      )) : (
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
                          onClick={() => setSearchPage(p => Math.max(1, p - 1))}
                          disabled={searchPage === 1}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                          이전
                        </button>
                        <span className="text-xs text-slate-500 font-medium">
                          {searchPage} <span className="text-slate-300">/</span> {Math.ceil(totalSearchResults / 10)} 페이지
                        </span>
                        <button 
                          type="button"
                          onClick={() => setSearchPage(p => Math.min(Math.ceil(totalSearchResults / 10), p + 1))}
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
            ) : (
              <div className="mt-1 flex items-center justify-between p-3 bg-primary-50 rounded-xl border border-primary-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-14 bg-white rounded shadow-sm overflow-hidden flex-shrink-0">
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{selectedBook.title}</p>
                    <p className="text-xs text-slate-500">{selectedBook.author}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="text-xs font-medium text-primary-600 bg-white px-2 py-1.5 rounded-md border border-primary-200 hover:bg-primary-100 transition-colors"
                >
                  다시 검색
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pages Read */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Book size={16} className="text-slate-400"/> 페이지 기록
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="시작" 
                  value={startPage}
                  onChange={(e) => setStartPage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                />
                <span className="text-slate-400">~</span>
                <input 
                  type="number" 
                  placeholder="끝" 
                  value={endPage}
                  onChange={(e) => setEndPage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                />
                <span className="text-slate-600 font-medium whitespace-nowrap">쪽</span>
              </div>
            </div>

            {/* Reading Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock size={16} className="text-slate-400"/> 독서 시간
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="예: 45" 
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                />
                <span className="text-slate-600 font-medium whitespace-nowrap">분</span>
              </div>
            </div>
          </div>

          {/* Review / Memo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Edit3 size={16} className="text-slate-400"/> 한 줄 평 및 메모
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

        {/* Footer */}
        <div className={`bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center ${initialRecord ? 'justify-between' : 'justify-end'} gap-3 rounded-b-3xl`}>
          {initialRecord && (
            <button 
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl text-rose-500 font-medium hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-sm"
            >
              <Trash2 size={16} />
              삭제
            </button>
          )}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-200/50 transition-colors"
            >
              취소
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={!selectedBook}
            >
              {initialRecord ? '수정 저장하기' : '기록 저장하기'}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordModal;
