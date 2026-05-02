import { supabase } from './supabase';

/**
 * 네이버 도서 검색 API 호출
 */
export const searchNaverBooks = async (searchType, debouncedQuery, searchPage) => {
  if (debouncedQuery.trim().length < 2) return { items: [], total: 0 };

  const searchParams = new URLSearchParams({
    display: 10,
    start: (searchPage - 1) * 10 + 1,
    sort: 'sim',
  });

  if (searchType === 'kwd') {
    searchParams.append('query', debouncedQuery);
  } else {
    if (searchType === 'title') searchParams.append('d_titl', debouncedQuery);
    if (searchType === 'isbn') searchParams.append('d_isbn', debouncedQuery);
  }

  const res = await fetch(`/api/naver-search?${searchParams.toString()}`);

  if (!res.ok) throw new Error(`Naver API error: ${res.status}`);

  const jsonData = await res.json();
  const parsedResults = (jsonData.items || []).map((item, index) => {
    const rawTitle = item.title || '제목 없음';
    const rawAuthor = item.author || '작자 미상';
    return {
      id: `naver-${index}-${Date.now()}`,
      title: rawTitle.replace(/<[^>]*>?/gm, ''),
      author: rawAuthor.replace(/<[^>]*>?/gm, ''),
      coverUrl: item.image || 'https://via.placeholder.com/128x192.png?text=No+Cover',
      isbn: item.isbn || '',
      pageCount: 300,
    };
  });

  return {
    items: parsedResults,
    total: parseInt(jsonData.total || 0),
  };
};

/**
 * 도서 선택 시 상세 정보 처리 (서지 API, 이미지 캐싱 등)
 */
export const processBookSelection = async (book) => {
  let finalBook = { ...book };

  if (!book.isbn) return finalBook;

  const cleanIsbn = book.isbn.replace(/[^0-9X\s]/gi, '').split(' ')[0].substring(0, 13);
  if (!cleanIsbn) return finalBook;

  try {
    // 1. Supabase DB에서 캐시된 책 메타데이터 확인
    const { data: cachedBook } = await supabase
      .from('books')
      .select('*')
      .eq('isbn', cleanIsbn)
      .maybeSingle();

    if (cachedBook) {
      return {
        ...finalBook,
        title: cachedBook.title || finalBook.title,
        author: cachedBook.author || finalBook.author,
        coverUrl: cachedBook.cover_url || finalBook.coverUrl,
        pageCount: cachedBook.total_pages > 0 ? cachedBook.total_pages : finalBook.pageCount,
        genre: cachedBook.genre || '',
      };
    }

    // 2. 캐시 데이터가 없으면 국립중앙도서관(서지) API 호출
    const res = await fetch(`/api/seoji-search?isbn=${cleanIsbn}`);

    if (res.ok) {
      const data = await res.json();
      const items = data.docs || [];
      if (items.length > 0) {
        const detail = items[0];
        const parsedPages = parseInt(detail.PAGE) || 0;
        finalBook.title = detail.TITLE || finalBook.title;
        finalBook.author = detail.AUTHOR || finalBook.author;
        finalBook.pageCount = parsedPages > 0 ? parsedPages : finalBook.pageCount;
      }
    }

    // 3. 네이버 썸네일 이미지를 Supabase Storage에 저장
    let supabaseImageUrl = finalBook.coverUrl;
    if (finalBook.coverUrl && finalBook.coverUrl.includes('pstatic.net')) {
      try {
        const imgRes = await fetch(`/api/image-proxy?url=${encodeURIComponent(finalBook.coverUrl)}`);
        const imgBlob = await imgRes.blob();
        const fileExt = imgBlob.type.split('/')[1] || 'jpg';
        const fileName = `${cleanIsbn}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(fileName, imgBlob, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('book-covers')
            .getPublicUrl(fileName);
          supabaseImageUrl = publicUrlData.publicUrl;
          finalBook.coverUrl = supabaseImageUrl;
        }
      } catch (e) {
        console.warn('Failed to upload image to Supabase', e);
      }
    }

    // 4. 새로운 책 정보를 DB에 캐싱
    await supabase.from('books').insert({
      isbn: cleanIsbn,
      title: finalBook.title,
      author: finalBook.author,
      cover_url: supabaseImageUrl,
      total_pages: finalBook.pageCount,
    });
  } catch (err) {
    console.error('Book selection processing failed:', err);
  }

  return finalBook;
};
