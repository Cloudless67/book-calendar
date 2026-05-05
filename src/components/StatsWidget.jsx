import React from 'react';
import { BookMarked, TrendingUp, Flame } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { statsAtom } from '../store';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, gradientClass }) => (
  <div className="glass-card p-6 flex items-start justify-between group hover:-translate-y-1 transition-all duration-300">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">{value}</h3>
      <p className="text-xs text-slate-500 flex items-center gap-1">
        {subtitle}
      </p>
    </div>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradientClass} ${colorClass} shadow-lg transition-transform group-hover:scale-110 duration-300`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const StatsWidget = () => {
  const stats = useAtomValue(statsAtom);

  const getCompletedSubtitle = (count) => {
    if (count === 0) return <span className="text-slate-500 font-medium">독서를 시작해볼까요?</span>;
    if (count <= 3) return <><TrendingUp size={12} className="text-emerald-500" /> <span className="text-emerald-600 font-medium">잘하고 있어요!</span></>;
    return <><TrendingUp size={12} className="text-emerald-500" /> <span className="text-emerald-600 font-medium">엄청난 독서량이에요!</span></>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard 
        title="이번 달 완독" 
        value={`${stats.booksReadThisMonth}권`}
        subtitle={getCompletedSubtitle(stats.booksReadThisMonth)}
        icon={BookMarked}
        gradientClass="from-primary-500 to-primary-600"
      />
      <StatCard 
        title="이번 달 읽은 페이지" 
        value={`${stats.pagesReadThisMonth || 0}p`}
        subtitle="꾸준히 읽고 있어요!"
        icon={TrendingUp}
        gradientClass="from-emerald-400 to-emerald-500"
      />
      <StatCard 
        title="연속 독서" 
        value={`${stats.currentStreak}일`}
        subtitle={`최고 기록: ${stats.maxStreak || 0}일`}
        icon={Flame}
        gradientClass="from-orange-400 to-rose-500"
      />
    </div>
  );
};

export default StatsWidget;
