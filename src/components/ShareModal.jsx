import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import dayjs from 'dayjs';

const ShareModal = ({ isOpen, onClose, currentDate, readings, stats }) => {
  const shareRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [coverDataUrls, setCoverDataUrls] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setPreviewImage(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Pre-convert images to base64 Data URLs when modal is open
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const currentMonthReadings = readings.filter(r => dayjs(r.date).isSame(currentDate, 'month'));
    const urls = Array.from(new Set(currentMonthReadings.map(r => r.coverUrl).filter(Boolean)));

    const convertAll = async () => {
      const map = {};
      await Promise.all(
        urls.map(async (url) => {
          if (url.startsWith('data:')) {
            map[url] = url;
            return;
          }
          try {
            const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            if (!res.ok) return;
            const blob = await res.blob();
            const dataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = () => resolve('');
              reader.readAsDataURL(blob);
            });
            if (dataUrl) map[url] = dataUrl;
          } catch (e) {
            console.warn('Failed to pre-convert image:', e);
          }
        })
      );

      if (isMounted) {
        setCoverDataUrls(map);
      }
    };

    convertAll();

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentDate, readings]);

  if (!isOpen) return null;

  const monthStart = currentDate.startOf('month');
  const monthEnd = monthStart.endOf('month');
  const startDate = monthStart.startOf('week');
  const endDate = monthEnd.endOf('week');

  const days = [];
  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    days.push(current);
    current = current.add(1, 'day');
  }

  // Calculate month stats
  const currentMonthReadings = readings.filter(r => dayjs(r.date).isSame(currentDate, 'month'));
  const completedBooks = new Set(currentMonthReadings.filter(r => r.status === 'completed').map(r => r.bookTitle)).size;
  const totalPages = currentMonthReadings.reduce((sum, r) => {
    const delta = (r.endPage !== undefined && r.startPage !== undefined) 
                  ? (parseInt(r.endPage) || 0) - (parseInt(r.startPage) || 0)
                  : (parseInt(r.pagesRead) || 0);
    return sum + Math.max(0, delta);
  }, 0);
  
  // Simple streak calculation (consecutive days reading up to today in this month)
  let streak = 0;
  let checkDate = dayjs();
  while(checkDate.isAfter(monthStart) || checkDate.isSame(monthStart, 'day')) {
    const formatted = checkDate.format('YYYY-MM-DD');
    if (readings.some(r => r.date === formatted)) {
      streak++;
      checkDate = checkDate.subtract(1, 'day');
    } else {
      break;
    }
  }

  const getImageSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) {
      return url;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  // Pure 2D Canvas Renderer for 100% iOS WebKit & Mobile Compatibility
  const renderShareCardToCanvas = async () => {
    const canvas = document.createElement('canvas');
    const width = 960;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Helper for rounded rectangle
    const drawRoundRect = (x, y, w, h, radius, fillStyle, strokeStyle, strokeWidth = 1) => {
      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, radius);
      } else {
        ctx.rect(x, y, w, h);
      }
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
      ctx.restore();
    };

    // Header
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('📚', 60, 80);

    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Book', 115, 80);
    const bookWidth = ctx.measureText('Book').width;
    ctx.fillStyle = '#2563eb';
    ctx.fillText('Log', 115 + bookWidth, 80);

    // Right Header
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(currentDate.format('YYYY년 M월'), width - 60, 70);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('나의 독서 여정', width - 60, 100);

    // Grid setup
    const paddingX = 60;
    const startY = 150;
    const gap = 16;
    const cols = 7;
    const cellWidth = Math.floor((width - paddingX * 2 - (cols - 1) * gap) / cols); // ~106px
    const cellHeight = cellWidth;

    // Pre-load all images for canvas
    const imageMap = {};
    await Promise.all(
      days.map(async (day) => {
        const dayReadings = readings.filter(r => r.date === day.format('YYYY-MM-DD'));
        const coverUrl = dayReadings.length > 0 ? dayReadings[0].coverUrl : null;
        if (!coverUrl || imageMap[coverUrl]) return;

        try {
          const imgSrc = coverDataUrls[coverUrl] || getImageSrc(coverUrl);
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            img.src = imgSrc;
          });
          if (img.complete && img.naturalWidth > 0) {
            imageMap[coverUrl] = img;
          }
        } catch (e) {
          console.warn('Canvas image pre-load failed:', e);
        }
      })
    );

    // Draw Grid
    days.forEach((day, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = paddingX + col * (cellWidth + gap);
      const y = startY + row * (cellHeight + gap);

      const isCurrentMonth = day.isSame(currentDate, 'month');
      const isToday = day.isSame(dayjs(), 'day');
      const dayReadings = readings.filter(r => r.date === day.format('YYYY-MM-DD'));
      const completed = dayReadings.some(r => r.status === 'completed');
      const coverUrl = dayReadings.length > 0 ? dayReadings[0].coverUrl : null;
      const dayNumber = day.format('D');

      if (!isCurrentMonth) {
        drawRoundRect(x, y, cellWidth, cellHeight, 16, '#f8fafc', '#f1f5f9');
        return;
      }

      const loadedImg = coverUrl ? imageMap[coverUrl] : null;

      if (loadedImg) {
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, cellWidth, cellHeight, 16);
        } else {
          ctx.rect(x, y, cellWidth, cellHeight);
        }
        ctx.clip();

        const imgRatio = loadedImg.naturalWidth / loadedImg.naturalHeight;
        const cellRatio = cellWidth / cellHeight;
        let drawW = cellWidth;
        let drawH = cellHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > cellRatio) {
          drawW = cellHeight * imgRatio;
          offsetX = (cellWidth - drawW) / 2;
        } else {
          drawH = cellWidth / imgRatio;
          offsetY = (cellHeight - drawH) / 2;
        }

        ctx.drawImage(loadedImg, x + offsetX, y + offsetY, drawW, drawH);

        if (!completed) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(x, y, cellWidth, cellHeight);
        }

        ctx.restore();

        // Day number text
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(dayNumber, x + 10, y + 8);
        ctx.restore();

        // Completed badge
        if (completed) {
          ctx.save();
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x + cellWidth - 54, y, 54, 28, [0, 16, 0, 12]);
          } else {
            ctx.rect(x + cellWidth - 54, y, 54, 28);
          }
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.font = 'bold 16px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('완독', x + cellWidth - 27, y + 14);
          ctx.restore();
        }
      } else if (isToday) {
        drawRoundRect(x, y, cellWidth, cellHeight, 16, '#ffffff', '#93c5fd', 3);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#3b82f6';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(dayNumber, x + 10, y + 8);

        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TODAY', x + cellWidth / 2, y + cellHeight / 2 + 6);
      } else {
        drawRoundRect(x, y, cellWidth, cellHeight, 16, '#f1f5f9');
        ctx.font = '500 20px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(dayNumber, x + 10, y + 8);
      }
    });

    // Footer
    const footerY = height - 140;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, footerY);
    ctx.lineTo(width - 60, footerY);
    ctx.stroke();

    const statsY = footerY + 35;

    // Stat 1: 완독
    ctx.textAlign = 'center';
    ctx.font = '500 18px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('완독', 120, statsY);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${completedBooks}권`, 120, statsY + 40);

    // Stat 2: 총 페이지
    ctx.font = '500 18px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('총 페이지', 270, statsY);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${totalPages}p`, 270, statsY + 40);

    // Stat 3: 연속
    ctx.font = '500 18px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('연속', 410, statsY);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.fillText(`${streak}일`, 410, statsY + 40);

    // Right footer brand info
    ctx.textAlign = 'right';
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('책 읽는 습관을 시각적으로 관리하세요.', width - 60, statsY + 10);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('booklog.cloudles.blog', width - 60, statsY + 42);

    return canvas.toDataURL('image/png');
  };

  const handleDownload = async () => {
    if (isCapturing) return;
    try {
      setIsCapturing(true);

      // Render pixel-perfect PNG using native 2D Canvas (100% compatible with iOS WebKit)
      let dataUrl = await renderShareCardToCanvas();

      if (!dataUrl || dataUrl === 'data:,') {
        dataUrl = await toPng(shareRef.current, {
          cacheBust: false,
          skipFonts: true,
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
      }

      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('이미지 변환 결과가 비어있습니다.');
      }

      const fileName = `booklog-${currentDate.format('YYYY-MM')}.png`;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // 1. Try Web Share API for Mobile Devices
      if (isMobile && navigator.canShare && navigator.share) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'BookLog 독서 캘린더',
            });
            return;
          }
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
        }
      }

      // 2. On Mobile browsers: Show preview overlay for long press save
      if (isMobile) {
        setPreviewImage(dataUrl);
        return;
      }

      // 3. Desktop download
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to generate image', error);
      alert('이미지 저장 중 오류가 발생했습니다: ' + (error.message || error));
    } finally {
      setIsCapturing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative w-full max-w-[520px] max-h-[90vh] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200/50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800">이달의 독서 기록 공유</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Share Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center items-start bg-slate-100/50 custom-scrollbar">
          {/* The actual element to be captured */}
          <div 
            ref={shareRef}
            className="w-full max-w-[480px] aspect-[4/5] bg-white rounded-3xl shadow-xl flex flex-col justify-between border border-slate-100 overflow-hidden relative p-6 md:p-8 shrink-0"
          >
            <header className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">📚</span>
                <h1 className="text-xl font-black text-slate-950 tracking-tighter">Book<span className="text-primary-600">Log</span></h1>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-950">{currentDate.format('YYYY년 M월')}</p>
                <p className="text-xs text-slate-500 font-medium">나의 독서 여정</p>
              </div>
            </header>

            <section className="flex-grow flex items-center justify-center">
              <div className="grid grid-cols-7 gap-1.5 md:gap-2.5 w-full">
                {days.map((day, i) => {
                  const isCurrentMonth = day.isSame(currentDate, 'month');
                  const isToday = day.isSame(dayjs(), 'day');
                  const dayReadings = readings.filter(r => r.date === day.format('YYYY-MM-DD'));
                  const completed = dayReadings.some(r => r.status === 'completed');
                  const coverUrl = dayReadings.length > 0 ? dayReadings[0].coverUrl : null;

                  const dayNumber = day.format('D');

                  if (!isCurrentMonth) {
                    return <div key={i} className="aspect-square bg-slate-50 rounded-xl border border-slate-100"></div>;
                  }

                  if (coverUrl) {
                    const imgSrc = coverDataUrls[coverUrl] || getImageSrc(coverUrl);
                    return (
                      <div 
                        key={i} 
                        className="aspect-square rounded-xl relative shadow-inner overflow-hidden flex items-center justify-center bg-slate-100"
                        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}
                      >
                        <img 
                          src={imgSrc} 
                          alt="" 
                          data-raw-url={coverUrl}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <span className="absolute top-1 left-1.5 text-[9px] md:text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] z-20">
                          {dayNumber}
                        </span>
                        {completed && (
                          <span className="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-amber-500 text-white text-[7px] lg:text-[8px] font-bold px-1 py-0.5 rounded-bl-md shadow-sm z-20">
                            완독
                          </span>
                        )}
                        {!completed && <div className="absolute inset-0 bg-white/20 rounded-xl z-10 pointer-events-none" />}
                      </div>
                    );
                  }

                  if (isToday) {
                    return (
                      <div key={i} className="aspect-square bg-white rounded-xl border-2 border-dashed border-primary-300 flex items-center justify-center relative">
                        <span className="absolute top-0.5 left-1.5 text-[9px] md:text-[10px] font-bold text-primary-500">
                          {dayNumber}
                        </span>
                        <span className="text-primary-500 text-[10px] md:text-xs font-bold scale-75 md:scale-100">TODAY</span>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className="aspect-square bg-slate-100 rounded-xl relative">
                      <span className="absolute top-1 left-1.5 text-[9px] md:text-[10px] font-medium text-slate-400">
                        {dayNumber}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <footer className="mt-8 pt-6 border-t border-slate-100 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium">완독</p>
                    <p className="text-lg md:text-xl font-extrabold text-slate-950">{completedBooks}<span className="text-xs md:text-sm text-slate-400 font-normal">권</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium">총 페이지</p>
                    <p className="text-lg md:text-xl font-extrabold text-slate-950">{totalPages}<span className="text-xs md:text-sm text-slate-400 font-normal">p</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium">연속</p>
                    <p className="text-lg md:text-xl font-extrabold text-primary-600">{streak}<span className="text-xs md:text-sm text-primary-300 font-normal">일</span></p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-[8px] md:text-[10px] text-slate-300">책 읽는 습관을 시각적으로 관리하세요.</p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-tighter">booklog.cloudles.blog</p>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleDownload}
            disabled={isCapturing}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCapturing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download size={18} />
                이미지 저장
              </>
            )}
          </button>
        </div>
        </div>

        {/* Mobile Preview Overlay for Long-press Save */}
        {previewImage && (
          <div className="fixed inset-0 z-[120] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-4 max-w-[360px] w-full flex flex-col items-center gap-3 text-center shadow-2xl">
              <div className="flex items-center justify-between w-full pb-2 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">📸 이미지 저장 안내</span>
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-primary-600 font-bold bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                💡 아래 이미지를 길게 눌러 [사진 앱에 저장]을 눌러주세요!
              </p>
              <div className="w-full max-h-[50vh] overflow-hidden rounded-xl border border-slate-200">
                <img 
                  src={previewImage} 
                  alt="BookLog 독서 캘린더" 
                  className="w-full h-auto object-contain rounded-xl select-all"
                />
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-full py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
