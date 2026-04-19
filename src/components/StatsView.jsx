import React from 'react';
import { useAtomValue } from 'jotai';
import { statsAtom, readingsAtom } from '../store';
import { genreData } from '../mockData';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Award, Target, Flame } from 'lucide-react';

const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

const StatsView = () => {
  const stats = useAtomValue(statsAtom);
  const readings = useAtomValue(readingsAtom);

  // 차트를 위한 임시 월별 데이터 생성 로직
  const monthlyData = [
    { name: '1월', 읽은책: 2, 페이지: 650 },
    { name: '2월', 읽은책: 3, 페이지: 820 },
    { name: '3월', 읽은책: 1, 페이지: 320 },
    { name: '4월', 읽은책: stats.booksReadThisMonth || 0, 페이지: stats.totalPagesRead || 0 }, // 현재 우리가 계산한 이달 통계
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <p className="text-sm font-medium text-primary-600 mb-1">나의 독서 패턴 분석</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">통계 인사이트</h1>
        </div>
      </header>

      {/* 요약 강조 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-primary-500/20">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-primary-100 font-medium mb-2 flex items-center gap-2"><Award size={18} /> 상위 10% 다독가</h2>
            <p className="text-2xl md:text-3xl font-bold mb-4">훌륭합니다! 이번 달 목표인<br className="hidden md:block"/>1000쪽을 향해 순항 중이에요.</p>
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-primary-200 text-xs">현재 달성률</p>
                <p className="text-2xl font-bold">{stats.goalProgress}%</p>
              </div>
              <div className="w-px h-8 bg-primary-500/50"></div>
              <div>
                <p className="text-primary-200 text-xs">총 읽은 페이지</p>
                <p className="text-2xl font-bold">{stats.totalPagesRead}p</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden">
           <Flame className="absolute -bottom-4 -right-4 w-32 h-32 text-orange-50 opacity-50" />
           <p className="text-slate-500 font-medium mb-2 text-sm flex items-center gap-2">연속 독서 기록</p>
           <div className="flex items-end gap-3 mb-4">
             <span className="text-4xl md:text-5xl font-bold text-orange-500 tracking-tight">{stats.currentStreak}</span>
             <span className="text-lg md:text-xl font-bold text-slate-700 mb-1.5">일째 불타는 중!</span>
           </div>
           <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-[80%]">
             매일 10쪽이라도 꾸준히 읽는 습관이 가장 중요합니다. 내일도 꼭 기록을 남겨주세요.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 장르 분포 파이 차트 */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Target size={18} className="text-primary-500"/> 내 취향 장르 분포
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {genreData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value}%)
              </div>
            ))}
          </div>
        </div>

        {/* 월별 독서량 바 차트 */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500"/> 월별 완독 권수 추이
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <RechartsTooltip 
                   cursor={{ fill: '#f1f5f9' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="읽은책" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
