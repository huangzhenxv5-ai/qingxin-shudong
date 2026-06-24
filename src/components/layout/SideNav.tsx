import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettingsStore } from '@/stores/settingsStore';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  desc: string;
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, ReactNode> = {
    home: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    diary: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    chat: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    monster: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 4v6" />
        <path d="M16 4v6" />
      </svg>
    ),
    content: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    growth: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
    dailyCard: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
    breathing: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="7" opacity="0.5" />
        <circle cx="12" cy="12" r="11" opacity="0.25" />
      </svg>
    ),
    profile: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    collapse: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ),
    expand: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
  };
  return <>{icons[name]}</>;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '首页', icon: <Icon name="home" />, desc: '今日心情概览' },
  { path: '/diary', label: '情绪日记', icon: <Icon name="diary" />, desc: '记录每天的心情' },
  { path: '/chat', label: 'AI 树洞', icon: <Icon name="chat" />, desc: '倾诉你的心事' },
  { path: '/cards', label: '情绪卡牌', icon: <Icon name="monster" />, desc: '学习情绪调节' },
  { path: '/daily-card', label: '每日日签', icon: <Icon name="dailyCard" />, desc: '生成治愈图片' },
  { path: '/breathing', label: '呼吸放松', icon: <Icon name="breathing" />, desc: '平复心情节奏' },
  { path: '/growth', label: '成长档案', icon: <Icon name="growth" />, desc: '看见情绪轨迹' },
  { path: '/content', label: '正向内容', icon: <Icon name="content" />, desc: '温暖治愈图文' },
  { path: '/profile', label: '我的', icon: <Icon name="profile" />, desc: '个人设置' },
];

export function SideNav() {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);

  return (
    <nav
      className="h-full flex flex-col border-r overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
      aria-label="侧边导航"
      role="navigation"
    >
      {/* Logo 区 + 收起按钮 */}
      <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-3'} px-2 py-4 mb-3 transition-all duration-300`}>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl relative overflow-hidden flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 200%)',
          }}
          aria-hidden="true"
        >
          <span className="relative z-10">🌳</span>
          <div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-30"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-base font-heading font-bold tracking-tight truncate" style={{ color: 'var(--color-text)' }}>
              青心树洞
            </div>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
              情绪陪伴角落
            </p>
          </div>
        )}
        {/* 收起/展开切换按钮 */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 flex-shrink-0 hover:bg-black/5 focus-visible:outline-none min-w-[44px] min-h-[44px] relative z-20"
          style={{
            color: 'var(--color-text-secondary)',
            backgroundColor: collapsed ? 'var(--color-bg)' : 'transparent',
          }}
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          aria-expanded={!collapsed}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <span className="transition-transform duration-300" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <Icon name="collapse" />
          </span>
        </button>
      </div>

      {/* 导航项 */}
      <ul className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-2" role="list">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all duration-300 focus-visible:outline-none min-h-[44px] ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              })}
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                    style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="text-sm leading-tight truncate">{item.label}</div>
                      {isActive && (
                        <div className="text-xs mt-0.5 opacity-70 leading-tight truncate">{item.desc}</div>
                      )}
                    </div>
                  )}
                  {isActive && !collapsed && (
                    <span
                      className="block w-1 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      aria-hidden="true"
                    />
                  )}
                  {/* 收起状态下的激活指示条（左侧） */}
                  {isActive && collapsed && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 block w-1 h-8 rounded-r-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* 底部装饰 */}
      {!collapsed ? (
        <div
          className="mt-3 mx-2 p-3 rounded-2xl text-center transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent-light) 100%)',
          }}
        >
          <p className="text-xs font-medium" style={{ color: 'var(--color-primary-dark)' }}>
            💚 你不是一个人
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            每一种感受都值得被看见
          </p>
        </div>
      ) : (
        <div
          className="mt-3 mx-2 p-2 rounded-2xl text-center transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent-light) 100%)',
          }}
          title="💚 你不是一个人"
        >
          <span className="text-lg" aria-hidden="true">💚</span>
        </div>
      )}
    </nav>
  );
}
