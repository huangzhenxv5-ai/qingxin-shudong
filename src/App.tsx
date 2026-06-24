import { Routes, Route } from 'react-router-dom';
import { AuthGuard, GuestGuard } from '@/components/AuthGuard';
import { LoginPage } from '@/pages/Login/LoginPage';
import { RegisterPage } from '@/pages/Register/RegisterPage';
import { HomePage } from '@/pages/Home/HomePage';
import { DiaryPage } from '@/pages/Diary/DiaryPage';
import { ChatPage } from '@/pages/Chat/ChatPage';
import { CardGamePage } from '@/pages/CardGame/CardGamePage';
import { ContentPage } from '@/pages/Content/ContentPage';
import { ProfilePage } from '@/pages/Profile/ProfilePage';
import { GrowthPage } from '@/pages/Growth/GrowthPage';
import { DailyCardPage } from '@/pages/DailyCard/DailyCardPage';
import { BreathingPage } from '@/pages/Breathing/BreathingPage';

export default function App() {
  return (
    <Routes>
      {/* 公开路由：已登录用户不可访问 */}
      <Route
        path="/login"
        element={
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        }
      />
      <Route
        path="/register"
        element={
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        }
      />

      {/* 受保护路由：未登录用户跳转登录页 */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <HomePage />
          </AuthGuard>
        }
      />
      <Route
        path="/diary"
        element={
          <AuthGuard>
            <DiaryPage />
          </AuthGuard>
        }
      />
      <Route
        path="/chat"
        element={
          <AuthGuard>
            <ChatPage />
          </AuthGuard>
        }
      />
      <Route
        path="/cards"
        element={
          <AuthGuard>
            <CardGamePage />
          </AuthGuard>
        }
      />
      <Route
        path="/content"
        element={
          <AuthGuard>
            <ContentPage />
          </AuthGuard>
        }
      />
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        }
      />
      <Route
        path="/growth"
        element={
          <AuthGuard>
            <GrowthPage />
          </AuthGuard>
        }
      />
      <Route
        path="/daily-card"
        element={
          <AuthGuard>
            <DailyCardPage />
          </AuthGuard>
        }
      />
      <Route
        path="/breathing"
        element={
          <AuthGuard>
            <BreathingPage />
          </AuthGuard>
        }
      />

      {/* 兜底：未匹配路由跳转首页 */}
      <Route path="*" element={<AuthGuard><HomePage /></AuthGuard>} />
    </Routes>
  );
}
