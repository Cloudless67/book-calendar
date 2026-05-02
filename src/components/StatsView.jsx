import React from 'react';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { statsAtom, readingsAtom, booksAtom } from '../store';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Award, Target, Flame } from 'lucide-react';

const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

const StatsView = () => {
  const stats = useAtomValue(statsAtom);
  const readings = useAtomValue(readingsAtom);
  const books = useAtomValue(booksAtom);

  const getSummaryMessage = (stats) => {
    if (stats.currentStreak >= 7) {
      return {
        badge: "최고의 꾸준함!",
        message: "대단해요! 일주일 이상 멈추지 않고 독서하셨네요."
      };
    } else if (stats.booksReadThisMonth >= 3) {
      return {
        badge: "엄청난 다독가!",
        message: `훌륭합니다! 이번 달에 벌써 ${stats.booksReadThisMonth}권을 완독하셨어요.`
      };
    } else if (stats.totalPagesRead >= 500) {
      return {
        badge: "지식이 쌓이는 중!",
        message: `멋집니다! 무려 ${stats.totalPagesRead}쪽의 지식을 흡수하셨어요.`
      };
    } else if (stats.totalPagesRead > 0) {
      return {
        badge: "좋은 시작!",
        message: "꾸준한 독서로 매일매일 성장하고 있어요."
      };
    } else {
      return {
        badge: "시작이 반!",
        message: "오늘부터 가벼운 마음으로 독서를 시작해볼까요?"
      };
    }
  };

  const summary = getSummaryMessage(stats);

  // 차트를 위한 최근 6개월 월별 데이터 생성 로직
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const monthObj = dayjs().subtract(5 - i, 'month');
    const monthLabel = monthObj.format('M월');
    
    const monthReadings = readings.filter(r => {
      const rDate = dayjs(r.date);
      return rDate.month() === monthObj.month() && rDate.year() === monthObj.year();
    });

    const booksRead = monthReadings.filter(r => r.status === 'completed').length;
    
    const pagesRead = monthReadings.reduce((acc, curr) => {
      const delta = (curr.endPage !== undefined && curr.startPage !== undefined) 
                    ? (parseInt(curr.endPage) || 0) - (parseInt(curr.startPage) || 0)
                    : (parseInt(curr.pagesRead) || 0);
      return acc + Math.max(0, delta);
    }, 0);

    return {
      name: monthLabel,
      읽은책: booksRead,
      페이지: pagesRead
    };
  });

  // 취향 장르 분포 동적 계산 (완독된 책 기준)
  const calculateGenreData = () => {
    const completedBooksGenreMap = {};
    
    // 완독(completed)된 책의 장르만 수집
    readings.forEach(r => {
      if (r.status === 'completed') {
         // booksAtom에서 해당 책 정보 찾기 (우선 isbn으로, 없으면 title로 검색)
         let bookObj = null;
         if (r.isbn) {
           bookObj = books.find(b => b.isbn === r.isbn);
         }
         if (!bookObj) {
           bookObj = books.find(b => b.title === r.bookTitle);
         }
         
         const g = (bookObj && bookObj.genre && bookObj.genre.trim() !== '') ? bookObj.genre : '미분류';
         // 같은 책의 완독 기록이 여러 번 있을 수도 있으므로 덮어쓰기 형태로 고유하게 유지
         completedBooksGenreMap[r.bookTitle] = g;
      }
    });

    const uniqueGenres = {};
    Object.values(completedBooksGenreMap).forEach(g => {
       uniqueGenres[g] = (uniqueGenres[g] || 0) + 1;
    });

    const totalBooks = Object.keys(completedBooksGenreMap).length;
    if (totalBooks === 0) return [];
    
    return Object.entries(uniqueGenres)
      .map(([name, count]) => ({
        name,
        value: count, // Count is used by Recharts to determine proportion
        percentage: Math.round((count / totalBooks) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  };
  
  const dynamicGenreData = calculateGenreData();

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
            <h2 className="text-primary-100 font-medium mb-2 flex items-center gap-2"><Award size={18} /> {summary.badge}</h2>
            <p className="text-2xl md:text-3xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: summary.message.replace('! ', '!<br className="hidden md:block"/>') }}></p>
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-primary-200 text-xs">이번 달 완독</p>
                <p className="text-2xl font-bold">{stats.booksReadThisMonth}권</p>
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
            {dynamicGenreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicGenreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dynamicGenreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    formatter={(value, name, props) => [`${props.payload.percentage}% (${value}권)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-slate-400 text-sm">기록된 장르 데이터가 없습니다.</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {dynamicGenreData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.percentage}%)
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
