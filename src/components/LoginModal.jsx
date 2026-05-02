import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const LoginModal = ({ onClose }) => {
  const handleLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error(`Error logging in with ${provider}:`, error.message);
      alert(`${provider} 로그인에 실패했습니다.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center transform transition-all relative">
        
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-2"
            aria-label="닫기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Logo or Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
             <img src="/booklog.png" alt="BookLog" className="w-14 h-14 object-contain" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">BookLog</h2>
        <p className="text-slate-500 mb-8 text-sm">
          독서 기록을 저장하고 관리하기 위해 로그인이 필요합니다.
        </p>

        <div className="space-y-4">
          {/* Google Button */}
          <button
            onClick={() => handleLogin('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all shadow-sm active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            구글로 계속하기
          </button>

          {/* Naver Button */}
          <button
            onClick={() => handleLogin('custom:naver')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#03C75A] hover:bg-[#02b351] text-white font-medium transition-all shadow-sm active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
            </svg>
            네이버로 계속하기
          </button>

          {/* Kakao Button */}
          {/* <button
            onClick={() => handleLogin('kakao')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#FEE500] hover:bg-[#e6cf00] text-[#000000] font-medium transition-all shadow-sm active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3c-5.523 0-10 3.535-10 7.896 0 2.822 1.83 5.297 4.542 6.643-.24 1.353-1.077 4.14-1.22 4.707-.156.62.24.613.504.425.21-.15 3.332-2.28 4.67-3.23.486.082.988.125 1.504.125 5.523 0 10-3.535 10-7.896C22 6.535 17.523 3 12 3z"/>
            </svg>
            카카오 로그인
          </button> */}
        </div>
        
        <div className="mt-8 text-xs text-slate-400">
          로그인 시 <Link to="/terms" className="underline hover:text-slate-600">서비스 이용약관</Link> 및 <Link to="/privacy" className="underline hover:text-slate-600">개인정보 처리방침</Link>에 동의하게 됩니다.
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
