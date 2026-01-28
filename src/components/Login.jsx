// src/components/Login.jsx
import React, { useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile, getUserProfile } from '../firebase/db';
import '../styles/Login.css';

export default function Login({ onLoginSuccess }) {
  useEffect(() => {
    // 이미 로그인한 사용자 확인
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 사용자 프로필 확인
        const userProfile = await getUserProfile(user.uid);
        if (!userProfile) {
          // 신규 사용자 프로필 생성
          await createUserProfile(user.uid, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        }
        onLoginSuccess(user);
      }
    });

    return () => unsubscribe();
  }, [onLoginSuccess]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 사용자 프로필 생성 또는 업데이트
      const userProfile = await getUserProfile(user.uid);
      if (!userProfile) {
        await createUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      }

      onLoginSuccess(user);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('로그인에 실패했습니다: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>📖 매거진</h1>
          <p>보드게임, 향수, 칵테일... 다양한 이야기를 담다</p>
        </div>

        <button className="google-signin-btn" onClick={handleGoogleSignIn}>
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 로그인
        </button>

        <div className="login-footer">
          <p>Firebase 기반 안전한 인증</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          padding: 48px 32px;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }

        .login-header h1 {
          margin: 0 0 12px;
          font-size: 32px;
          color: #1a1a1a;
        }

        .login-header p {
          margin: 0 0 32px;
          font-size: 14px;
          color: #666;
        }

        .google-signin-btn {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .google-signin-btn:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: #ccc;
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        .login-footer {
          margin-top: 24px;
          font-size: 12px;
          color: #999;
        }
      `}</style>
    </div>
  );
}
