import React from 'react';
import { useAtom } from 'jotai';
import { currentViewAtom } from '../store';
import { BookOpen, Calendar, PieChart, Settings, LogOut, Flame } from 'lucide-react';

const Sidebar = () => {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);

  const menuItems = [
    { id: 'calendar', icon: <Calendar size={20} />, label: '달력' },
    { id: 'library', icon: <BookOpen size={20} />, label: '내 서재' },
    { id: 'stats', icon: <PieChart size={20} />, label: '통계' },
  ];

  return (
    <aside className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-64 h-16 md:h-screen bg-white rounded-t-2xl md:rounded-none border-t md:border-r border-slate-200 flex flex-row md:flex-col md:p-6 z-50 transition-all shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] md:shadow-none">
      <div className="hidden md:flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <BookOpen className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
          BookLog
        </h1>
      </div>

      <div className="hidden md:block mb-8 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-orange-200 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" />
        <div className="flex items-center gap-3 mb-2">
          <Flame className="text-orange-500" size={20} />
          <span className="font-semibold text-slate-800">5일 연속 독서!</span>
        </div>
        <p className="text-xs text-slate-500">목표 달성까지 하루 남았어요. 오늘도 파이팅!</p>
      </div>

      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-2 py-1 md:p-0 space-x-1 md:space-x-0 md:space-y-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex-1 md:flex-none md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-1.5 md:py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-primary-700 font-medium' 
                  : 'text-slate-400 md:text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              } ${isActive ? 'md:bg-primary-50' : 'bg-transparent'}`}
            >
              <div className={isActive ? 'scale-110 transition-transform text-primary-600' : ''}>
                {item.icon}
              </div>
              <span className="text-[10px] md:text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="hidden md:block border-t border-slate-100 pt-6 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
          <Settings size={20} />
          <span>설정</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
          <LogOut size={20} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
