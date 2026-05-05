import { atom } from 'jotai';
import dayjs from 'dayjs';
import { supabase } from './lib/supabase';
import { mockReadings, mockStats } from './mockData';

// DB 초기화 및 관리용 상태
export const readingsAtom = atom([]);
export const isReadingsLoadedAtom = atom(false);

export const booksAtom = atom([]);

// Auth 상태
export const userAtom = atom(null);
export const isAuthLoadedAtom = atom(false);

// Supabase 연동: 초기 데이터 로드 (에러 시 mockData로 폴백)
export const loadReadingsAtom = atom(null, async (get, set) => {
  const user = get(userAtom);
  if (!user) {
    set(readingsAtom, []);
    set(isReadingsLoadedAtom, true);
    return;
  }

  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    console.warn('Supabase fetch returned error or DB not set. Falling back to mockReadings.', error);
    set(readingsAtom, mockReadings);
  } else if (data) {
    set(readingsAtom, data);
  }
  set(isReadingsLoadedAtom, true);
});

export const loadBooksAtom = atom(null, async (get, set) => {
  const { data, error } = await supabase.from('books').select('*');
  if (data) {
    set(booksAtom, data);
  } else if (error) {
    console.warn('Failed to load books from Supabase', error);
  }
});

// 기록 추가 액션 atom
export const addReadingAtom = atom(
  null,
  async (get, set, newReadingOrReadings) => {
    const user = get(userAtom);
    if (!user) return;
    
    const readingsArray = Array.isArray(newReadingOrReadings) ? newReadingOrReadings : [newReadingOrReadings];
    const insertData = readingsArray.map(({ id, ...rest }) => ({
      ...rest,
      user_id: user.id
    }));

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
    const user = get(userAtom);
    if (!user) return;

    const { id, ...readingToUpdate } = updatedReading;

    const { data, error } = await supabase
      .from('readings')
      .update(readingToUpdate)
      .eq('id', id)
      .eq('user_id', user.id)
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
    const user = get(userAtom);
    if (!user) return;

    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', idToDelete)
      .eq('user_id', user.id);

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
  
  const currentMonth = dayjs().format('YYYY-MM');
  const booksReadThisMonth = readings.filter(r => 
    r.status === 'completed' && dayjs(r.date).format('YYYY-MM') === currentMonth
  ).length;
  // 임시 목표치 1000
  const pagesReadThisMonth = readings
    .filter(r => dayjs(r.date).format('YYYY-MM') === currentMonth)
    .reduce((acc, curr) => {
      const delta = (curr.endPage !== undefined && curr.startPage !== undefined) 
                    ? (parseInt(curr.endPage) || 0) - (parseInt(curr.startPage) || 0)
                    : (parseInt(curr.pagesRead) || 0);
      return acc + Math.max(0, delta);
    }, 0);
  // 연속 기록 및 최고 기록 계산
  const uniqueDates = [...new Set(readings.map(r => dayjs(r.date).format('YYYY-MM-DD')))].sort((a, b) => dayjs(b).diff(dayjs(a)));
  
  let currentStreak = 0;
  let maxStreak = 0;
  
  if (uniqueDates.length > 0) {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    
    // Calculate current streak
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      currentStreak = 1;
      let currentDate = dayjs(uniqueDates[0]);
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const expectedDateStr = currentDate.subtract(1, 'day').format('YYYY-MM-DD');
        if (uniqueDates[i] === expectedDateStr) {
          currentStreak++;
          currentDate = currentDate.subtract(1, 'day');
        } else {
          break;
        }
      }
    }

    // Calculate max streak
    let tempStreak = 1;
    maxStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = dayjs(uniqueDates[i]);
      const next = dayjs(uniqueDates[i + 1]);
      if (curr.subtract(1, 'day').format('YYYY-MM-DD') === next.format('YYYY-MM-DD')) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
  }
  
  return {
    booksReadThisMonth,
    pagesReadThisMonth,
    currentStreak,
    maxStreak,
  };
});
