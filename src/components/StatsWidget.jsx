import React from 'react';
import { BookMarked, TrendingUp, Target, Clock } from 'lucide-react';
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="이번 달 완독" 
        value={`${stats.booksReadThisMonth}권`}
        subtitle={<><TrendingUp size={12} className="text-emerald-500" /> <span className="text-emerald-600 font-medium">잘하고 있어요!</span></>}
        icon={BookMarked}
        gradientClass="from-primary-500 to-primary-600"
      />
      <StatCard 
        title="총 읽은 페이지" 
        value={`${stats.totalPagesRead}p`}
        subtitle="목표 1,000p"
        icon={TrendingUp}
        gradientClass="from-emerald-400 to-emerald-500"
      />
      <StatCard 
        title="목표 달성률" 
        value={`${stats.goalProgress}%`}
        subtitle="아주 잘하고 있어요!"
        icon={Target}
        gradientClass="from-violet-500 to-purple-600"
      />
      <StatCard 
        title="연속 독서" 
        value={`${stats.currentStreak}일`}
        subtitle="최고 기록: 12일"
        icon={Clock}
        gradientClass="from-orange-400 to-rose-500"
      />
    </div>
  );
};

export default StatsWidget;
