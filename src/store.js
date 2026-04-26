import { atom } from 'jotai';
import { supabase } from './lib/supabase';
import { mockReadings, mockStats } from './mockData';

// DB 초기화 및 관리용 상태
export const readingsAtom = atom([]);
export const isReadingsLoadedAtom = atom(false);

// Supabase 연동: 초기 데이터 로드 (에러 시 mockData로 폴백)
export const loadReadingsAtom = atom(null, async (get, set) => {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.warn('Supabase fetch returned error or DB not set. Falling back to mockReadings.', error);
    set(readingsAtom, mockReadings);
  } else if (data) {
    set(readingsAtom, data);
  }
  set(isReadingsLoadedAtom, true);
});

// 현재 선택된 메뉴 뷰 ('calendar', 'library', 'stats')
export const currentViewAtom = atom('calendar');

// 기록 추가 액션 atom
export const addReadingAtom = atom(
  null,
  async (get, set, newReadingOrReadings) => {
    const readingsArray = Array.isArray(newReadingOrReadings) ? newReadingOrReadings : [newReadingOrReadings];
    const insertData = readingsArray.map(({ id, ...rest }) => rest);

    const { data, error } = await supabase
      .from('readings')
      .insert(insertData)
      .select();

    if (error) {
      console.warn('Supabase insert failed. Optimistically updating local state.', error);
      const prev = get(readingsAtom);
      set(readingsAtom, [...prev, ...readingsArray]);
    } else if (data && data.length > 0) {
      const prev = get(readingsAtom);
      set(readingsAtom, [...prev, ...data]);
    }
  }
);

// 기록 수정 액션 atom
export const updateReadingAtom = atom(
  null,
  async (get, set, updatedReading) => {
    const { id, ...readingToUpdate } = updatedReading;

    const { data, error } = await supabase
      .from('readings')
      .update(readingToUpdate)
      .eq('id', id)
      .select();

    if (error) {
      console.warn('Supabase update failed. Optimistically updating local state.', error);
      const prev = get(readingsAtom);
      set(readingsAtom, prev.map(r => r.id === id ? updatedReading : r));
    } else if (data && data.length > 0) {
      const prev = get(readingsAtom);
      set(readingsAtom, prev.map(r => r.id === id ? data[0] : r));
    }
  }
);

// 기록 삭제 액션 atom
export const deleteReadingAtom = atom(
  null,
  async (get, set, idToDelete) => {
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', idToDelete);

    if (error) {
      console.warn('Supabase delete failed. Optimistically updating local state.', error);
    }
    
    const prev = get(readingsAtom);
    set(readingsAtom, prev.filter(r => r.id !== idToDelete));
  }
);

// 통계 계산을 위한 derived atom
export const statsAtom = atom((get) => {
  const readings = get(readingsAtom);
  
  // 이번달 통계 등을 실제로는 날짜 기반으로 계산해야 하지만 일단 단순화
  const booksReadThisMonth = readings.filter(r => r.status === 'completed').length;
  // 임시 목표치 1000
  const totalPagesRead = readings.reduce((acc, curr) => {
    const delta = (curr.endPage !== undefined && curr.startPage !== undefined) 
                  ? (parseInt(curr.endPage) || 0) - (parseInt(curr.startPage) || 0)
                  : (parseInt(curr.pagesRead) || 0);
    return acc + Math.max(0, delta);
  }, 0);
  const goalProgress = Math.min(Math.round((totalPagesRead / 1000) * 100), 100);
  
  return {
    booksReadThisMonth,
    totalPagesRead,
    goalProgress,
    currentStreak: mockStats.currentStreak, // Streak 로직은 일단 기존 mock값 유지
  };
});
