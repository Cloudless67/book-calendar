import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAtom, useSetAtom } from 'jotai';
import { loadReadingsAtom, loadBooksAtom, userAtom, isAuthLoadedAtom } from './store';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import StatsWidget from './components/StatsWidget';
import CalendarWidget from './components/CalendarWidget';
import RecordModal from './components/RecordModal';
import LibraryView from './components/LibraryView';
import StatsView from './components/StatsView';
import LoginModal from './components/LoginModal';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';

function App() {
  const loadReadings = useSetAtom(loadReadingsAtom);
  const loadBooks = useSetAtom(loadBooksAtom);
  const [user, setUser] = useAtom(userAtom);
  const [isAuthLoaded, setIsAuthLoaded] = useAtom(isAuthLoadedAtom);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedBook, setSelectedBookState] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isPublicRoute = ['/privacy', '/terms'].includes(location.pathname);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setIsAuthLoaded]);

  useEffect(() => {
    if (isAuthLoaded) {
      loadReadings();
      loadBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoaded, user?.id, loadReadings, loadBooks]);

  const handleOpenModal = (date = new Date(), record = null, endDate = null, initialBook = null) => {
    setSelectedDate(date);
    setSelectedRecord(record);
    setSelectedEndDate(endDate);
    setSelectedBookState(initialBook);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedRecord(null);
    setSelectedEndDate(null);
    setSelectedBookState(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileMenuOpen(false);
  };

  if (!isAuthLoaded) {
    return <div className="flex min-h-dvh bg-slate-50/50 items-center justify-center"></div>;
  }
  
  return (
    <div className="flex min-h-dvh bg-slate-50/50 pb-16 md:pb-0 overflow-x-hidden w-full relative">
      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
      <Sidebar onOpenLoginModal={() => setIsLoginModalOpen(true)} />
      
      <main className="flex-1 min-w-0 md:ml-64 p-4 sm:p-6 lg:p-10 transition-all">
        <div className="max-w-6xl mx-auto">
          {/* 우측 상단 유저 프로필 영역 (공통) */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">
                      {user.user_metadata?.name || user.email?.split('@')[0] || user.user_metadata?.nickname}
                    </span>
                    <div 
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                      <img 
                        src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://ui-avatars.com/api/?name=${user.email || 'User'}&background=6366F1&color=fff`} 
                        alt="User Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* 드롭다운 메뉴 */}
                  {isProfileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsProfileMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          로그아웃
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm"
                >
                  로그인
                </button>
              )}
            </div>
          </div>

          <Routes>
            <Route path="/" element={
              <div className="animate-in fade-in duration-500">
                <header className="mb-8 flex justify-between items-end">
                  <div>
                    <p className="text-sm font-medium text-primary-600 mb-1">어제보다 더 성장하는 오늘</p>
                    <h1 className="text-3xl font-bold text-slate-800">나의 독서 대시보드</h1>
                  </div>
                </header>

                <StatsWidget />
                
                <div className="h-auto">
                  <CalendarWidget onOpenModal={handleOpenModal} />
                </div>
              </div>
            } />
            <Route path="/library" element={<LibraryView onOpenModal={handleOpenModal} />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>

        </div>
      </main>

      <RecordModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        initialDate={selectedDate}
        initialEndDate={selectedEndDate}
        initialRecord={selectedRecord}
        initialBook={selectedBook}
      />
    </div>
  );
}

export default App;
