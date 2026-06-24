import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { TabBar } from './TabBar';
import { Header } from './Header';
import { SideNav } from './SideNav';
import { SkipLink } from '@/components/ui/SkipLink';
import { useSettingsStore } from '@/stores/settingsStore';

interface MainLayoutProps {
  children: ReactNode;
  showTabBar?: boolean;
  title?: string;
}

const pageTitleMap: Record<string, string> = {
  '/': '首页',
  '/diary': '情绪日记',
  '/chat': 'AI 树洞',
  '/cards': '情绪卡牌',
  '/content': '正向内容',
  '/profile': '我的',
  '/growth': '成长档案',
  '/daily-card': '每日日签',
  '/breathing': '呼吸放松',
};

export function MainLayout({ children, showTabBar = true, title }: MainLayoutProps) {
  const location = useLocation();
  const pageTitle = title || pageTitleMap[location.pathname] || '青心树洞';
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <SkipLink />

      {/* 桌面端：左侧 SideNav + 主内容区 */}
      <div className="lg:flex lg:min-h-screen">
        {/* 桌面端侧边导航 */}
        {showTabBar && (
          <aside
            className={`hidden lg:block lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-screen transition-all duration-300 ease-in-out ${
              sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
            }`}
          >
            <SideNav />
          </aside>
        )}

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
          {/* 桌面端顶部 Header - 玻璃态 */}
          {showTabBar && (
            <div className="hidden lg:block sticky top-0 z-30">
              <Header title={pageTitle} />
            </div>
          )}

          {/* 主内容 */}
          <main
            id="main-content"
            role="main"
            className={`flex-1 ${showTabBar ? 'pb-24 lg:pb-10' : ''}`}
            tabIndex={-1}
          >
            <div className="app-container app-container-mobile px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* 移动端底部 TabBar */}
      {showTabBar && (
        <div className="lg:hidden">
          <TabBar />
        </div>
      )}
    </div>
  );
}
