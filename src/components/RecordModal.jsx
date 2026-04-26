import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import { useAtomValue, useSetAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';
import { addReadingAtom, updateReadingAtom, deleteReadingAtom, readingsAtom } from '../store';

// Lib & Components
import { searchNaverBooks, processBookSelection } from '../lib/bookApi';
import DateSelector from './record/DateSelector';
import BookSearch from './record/BookSearch';
import RecentBooks from './record/RecentBooks';
import BookSelectedCard from './record/BookSelectedCard';
import RecordFormFields from './record/RecordFormFields';

const RecordModal = ({ isOpen, onClose, initialDate, initialEndDate, initialRecord, initialBook }) => {
  const addReading = useSetAtom(addReadingAtom);
  const updateReading = useSetAtom(updateReadingAtom);
  const deleteReading = useSetAtom(deleteReadingAtom);
  const readings = useAtomValue(readingsAtom);

  const [status, setStatus] = useState('reading');
  const [searchType, setSearchType] = useState('kwd');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  
  const [recordDate, setRecordDate] = useState('');
  const [recordEndDate, setRecordEndDate] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);

  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [memo, setMemo] = useState('');

  const recentBooks = [];
  const seen = new Set();
  for (const r of readings) {
    if (!seen.has(r.bookTitle)) {
      seen.add(r.bookTitle);
      if (r.status !== 'completed') {
        recentBooks.push({
          title: r.bookTitle,
          author: r.author,
          coverUrl: r.coverUrl,
          pageCount: r.totalPages,
          isbn: r.isbn || ''
        });
        if (recentBooks.length >= 5) break;
      }
    }
  }

  const getAccumulatedPages = (bookTitle) => {
    const bookReadings = readings.filter(r => r.bookTitle === bookTitle);
    const hasEndPage = bookReadings.some(r => r.endPage !== undefined && r.endPage !== null);
    if (hasEndPage) {
      return Math.max(0, ...bookReadings.map(r => parseInt(r.endPage) || 0));
    }
    return bookReadings.reduce((sum, r) => sum + (parseInt(r.pagesRead) || 0), 0);
  };

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
        setStartPage(initialRecord.startPage !== undefined && initialRecord.startPage !== null ? initialRecord.startPage.toString() : '');
        setEndPage(initialRecord.endPage !== undefined && initialRecord.endPage !== null ? initialRecord.endPage.toString() : initialRecord.pagesRead ? initialRecord.pagesRead.toString() : '');
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
        setSelectedBook(initialBook || null);
        
        if (initialBook) {
          const accumulated = getAccumulatedPages(initialBook.title);
          setStartPage(accumulated > 0 ? accumulated.toString() : '');
        } else {
          setStartPage('');
        }
        
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
  }, [isOpen, initialRecord, initialBook]);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setShowDropdown(debouncedQuery.trim().length > 1);
  }, [debouncedQuery]);

  const { data: queryData, isFetching: isSearching } = useQuery({
    queryKey: ['naverSearch', searchType, debouncedQuery, searchPage],
    queryFn: () => searchNaverBooks(searchType, debouncedQuery, searchPage),
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 1000 * 60 * 60,
  });

  const searchResults = queryData?.items || [];
  const totalSearchResults = queryData?.total || 0;

  const handleSelectBook = async (book) => {
    setShowDropdown(false);
    setIsProcessingSelection(true);
    const finalBook = await processBookSelection(book);

    setSearchQuery('');
    setSelectedBook(finalBook);
    
    const accumulated = getAccumulatedPages(finalBook.title);
    setStartPage(accumulated > 0 ? accumulated.toString() : '');
    setEndPage(accumulated === 0 && finalBook.pageCount ? finalBook.pageCount.toString() : '');
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
      updateReading({
        id: initialRecord.id,
        bookTitle: selectedBook.title,
        author: selectedBook.author,
        coverUrl: selectedBook.coverUrl,
        date: recordDate,
        startPage: sPage,
        endPage: ePage,
        pagesRead: pagesReadAmount,
        totalPages: selectedBook.pageCount || ePage || 300,
        status: status,
        memo: memo,
        readingTime: parseInt(readingTime) || 0,
        rating: status === 'completed' ? 5 : (initialRecord.rating || 0)
      });
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

      let currentStart = sPage;
      const readingsToInsert = datesToRecord.map((d, index) => {
         const isLastDay = index === datesToRecord.length - 1;
         const pRead = dailyPages + (isLastDay ? remainderPages : 0);
         const cStatus = isLastDay ? status : 'reading';
         const currentEnd = currentStart + pRead;
         
         const record = {
          bookTitle: selectedBook.title,
          author: selectedBook.author,
          coverUrl: selectedBook.coverUrl,
          date: d,
          startPage: currentStart,
          endPage: currentEnd,
          pagesRead: pRead,
          totalPages: selectedBook.pageCount || ePage || 300,
          status: cStatus,
          memo: memo,
          readingTime: dailyTime,
          rating: cStatus === 'completed' ? 5 : 0
         };
         currentStart = currentEnd;
         return record;
      });
      addReading(readingsToInsert);
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg text-left overflow-visible animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8">
          {/* Header */}
          <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex flex-col gap-3 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{initialRecord ? '독서 기록 수정하기' : '독서 기록하기'}</h2>
                {initialRecord && (
                  <p className="text-sm text-slate-500 mt-1">{dayjs(recordDate).format('YYYY년 M월 D일 (dddd)')}의 기록을 수정합니다.</p>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {!initialRecord && (
              <DateSelector 
                isMultiDay={isMultiDay} setIsMultiDay={setIsMultiDay}
                recordDate={recordDate} setRecordDate={setRecordDate}
                recordEndDate={recordEndDate} setRecordEndDate={setRecordEndDate}
              />
            )}
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">어떤 책을 읽으셨나요?</label>
              {!selectedBook ? (
                <>
                  <BookSearch 
                    searchType={searchType} setSearchType={setSearchType}
                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                    setSearchPage={setSearchPage} isSearching={isSearching}
                    showDropdown={showDropdown} searchResults={searchResults}
                    totalSearchResults={totalSearchResults} searchPage={searchPage}
                    handleSelectBook={handleSelectBook} isProcessingSelection={isProcessingSelection}
                  />
                  <RecentBooks 
                    searchQuery={searchQuery} recentBooks={recentBooks} handleSelectBook={handleSelectBook}
                  />
                </>
              ) : (
                <BookSelectedCard selectedBook={selectedBook} onReselect={() => setSelectedBook(null)} />
              )}
            </div>

            <RecordFormFields 
              startPage={startPage} setStartPage={setStartPage}
              endPage={endPage} setEndPage={setEndPage}
              readingTime={readingTime} setReadingTime={setReadingTime}
              memo={memo} setMemo={setMemo}
              status={status} setStatus={setStatus}
            />
          </div>

          {/* Footer */}
          <div className={`bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center ${initialRecord ? 'justify-between' : 'justify-end'} gap-3 rounded-b-3xl`}>
            {initialRecord && (
              <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl text-rose-500 font-medium hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-sm">
                <Trash2 size={16} /> 삭제
              </button>
            )}
            <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-200/50 transition-colors">취소</button>
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
