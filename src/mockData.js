import dayjs from 'dayjs';

const today = dayjs();

export const mockReadings = [
  {
    id: 1,
    bookTitle: "클린 코드 (Clean Code)",
    author: "Robert C. Martin",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop",
    date: today.subtract(1, 'day').format('YYYY-MM-DD'),
    startPage: 0,
    endPage: 45,
    pagesRead: 45,
    totalPages: 584,
    status: "reading",
    rating: 0
  },
  {
    id: 2,
    bookTitle: "도둑맞은 집중력",
    author: "요한 하리",
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200&auto=format&fit=crop",
    date: today.subtract(2, 'day').format('YYYY-MM-DD'),
    startPage: 0,
    endPage: 60,
    pagesRead: 60,
    totalPages: 380,
    status: "completed",
    rating: 5
  },
  {
    id: 3,
    bookTitle: "총, 균, 쇠",
    author: "재레드 다이아몬드",
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=200&auto=format&fit=crop",
    date: today.format('YYYY-MM-DD'),
    startPage: 0,
    endPage: 30,
    pagesRead: 30,
    totalPages: 752,
    status: "reading",
    rating: 0
  },
  {
    id: 4,
    bookTitle: "생각의 탄생",
    author: "로버트 루트번스타인",
    coverUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=200&auto=format&fit=crop",
    date: today.subtract(4, 'day').format('YYYY-MM-DD'),
    startPage: 0,
    endPage: 85,
    pagesRead: 85,
    totalPages: 450,
    status: "completed",
    rating: 4
  }
];

export const mockStats = {
  booksReadThisMonth: 3,
  totalPagesRead: 854,
  goalProgress: 75,
  currentStreak: 5,
};

export const genreData = [
  { name: '개발/IT', value: 35 },
  { name: '인문학', value: 25 },
  { name: '소설', value: 20 },
  { name: '자기계발', value: 20 },
];
