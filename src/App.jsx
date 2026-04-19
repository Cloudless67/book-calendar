import React, { useState, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentViewAtom, loadReadingsAtom } from './store';
import Sidebar from './components/Sidebar';
import StatsWidget from './components/StatsWidget';
import CalendarWidget from './components/CalendarWidget';
import RecordModal from './components/RecordModal';
import LibraryView from './components/LibraryView';
import StatsView from './components/StatsView';

function App() {
  const currentView = useAtomValue(currentViewAtom);
  const loadReadings = useSetAtom(loadReadingsAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  const handleOpenModal = (date = new Date(), record = null, endDate = null) => {
    setSelectedDate(date);
    setSelectedRecord(record);
    setSelectedEndDate(endDate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedRecord(null);
    setSelectedEndDate(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 pb-16 md:pb-0 overflow-x-hidden w-full">
      <Sidebar />
      
      <main className="flex-1 min-w-0 md:ml-64 p-4 sm:p-6 lg:p-10 transition-all">
        <div className="max-w-6xl mx-auto">
          {/* 우측 상단 유저 프로필 영역 (공통) */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img src="https://ui-avatars.com/api/?name=User&background=6366F1&color=fff" alt="User Profile" />
              </div>
            </div>
          </div>

          {currentView === 'calendar' && (
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
          )}

          {currentView === 'library' && <LibraryView />}
          {currentView === 'stats' && <StatsView />}

        </div>
      </main>

      <RecordModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        initialDate={selectedDate}
        initialEndDate={selectedEndDate}
        initialRecord={selectedRecord}
      />
    </div>
  );
}

export default App;
