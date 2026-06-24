import { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface TabItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

// SVG 图标组件 - 保证视觉一致性
function Icon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    diary: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    chat: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    monster: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 4v6" />
        <path d="M16 4v6" />
      </svg>
    ),
    content: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    growth: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
    dailyCard: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
    breathing: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="7" opacity="0.5" />
        <circle cx="12" cy="12" r="11" opacity="0.25" />
      </svg>
    ),
    profile: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    more: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  };
  return <>{icons[name]}</>;
}

// 底部导航栏直接显示的主要页面
const PRIMARY_TABS: TabItem[] = [
  { path: '/', label: '首页', icon: <Icon name="home" /> },
  { path: '/diary', label: '日记', icon: <Icon name="diary" /> },
  { path: '/chat', label: '树洞', icon: <Icon name="chat" /> },
  { path: '/cards', label: '卡牌', icon: <Icon name="monster" /> },
  { path: '/profile', label: '我的', icon: <Icon name="profile" /> },
];

// 折叠到"更多"菜单中的次要页面
const MORE_TABS: TabItem[] = [
  { path: '/daily-card', label: '每日日签', icon: <Icon name="dailyCard" /> },
  { path: '/breathing', label: '呼吸放松', icon: <Icon name="breathing" /> },
  { path: '/growth', label: '成长档案', icon: <Icon name="growth" /> },
  { path: '/content', label: '正向内容', icon: <Icon name="content" /> },
];

export function TabBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  // 判断当前路由是否属于"更多"菜单中的页面
  const moreActive = MORE_TABS.some((tab) => {
    if (tab.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.path);
  });

  // 路由变化时关闭菜单
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  // 点击菜单外部关闭
  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(target) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(target)
      ) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [moreOpen]);

  // ESC 键关闭菜单并恢复焦点
  useEffect(() => {
    if (!moreOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [moreOpen]);

  // 打开菜单时将焦点移至第一个菜单项
  useEffect(() => {
    if (moreOpen && moreItemRefs.current[0]) {
      moreItemRefs.current[0]?.focus();
    }
  }, [moreOpen]);

  const handleMoreItemClick = useCallback(() => {
    setMoreOpen(false);
  }, []);

  // 键盘导航：在菜单项之间循环
  const handleMenuKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % MORE_TABS.length;
      moreItemRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + MORE_TABS.length) % MORE_TABS.length;
      moreItemRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setMoreOpen(false);
      moreButtonRef.current?.focus();
    }
  };

  return (
    <nav
      className="glass fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 border-t"
      style={{
        borderColor: 'var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="主导航"
    >
      <div className="flex items-center justify-around h-16">
        {/* 主要导航项 */}
        {PRIMARY_TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-300 focus-visible:outline-none min-h-[44px]"
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-hint)',
            })}
            aria-label={tab.label}
          >
            {({ isActive }) => (
              <>
                <span
                  className="transition-all duration-300"
                  style={{
                    transform: isActive ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
                  }}
                  aria-hidden="true"
                >
                  {tab.icon}
                </span>
                <span
                  className="text-xs font-medium transition-all duration-300 whitespace-nowrap"
                  style={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-1 block w-1 h-1 rounded-full transition-all duration-300"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* 更多按钮 */}
        <div className="relative flex-1 h-full flex items-center justify-center">
          <button
            ref={moreButtonRef}
            type="button"
            className="flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors duration-300 focus-visible:outline-none min-h-[44px]"
            style={{
              color: moreOpen || moreActive ? 'var(--color-primary)' : 'var(--color-text-hint)',
            }}
            onClick={() => setMoreOpen((prev) => !prev)}
            aria-label="更多导航"
            aria-haspopup="menu"
            aria-expanded={moreOpen}
          >
            <span
              className="transition-all duration-300"
              style={{
                transform: moreOpen || moreActive ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
              }}
              aria-hidden="true"
            >
              <Icon name="more" />
            </span>
            <span
              className="text-xs font-medium transition-all duration-300 whitespace-nowrap"
              style={{
                fontWeight: moreOpen || moreActive ? 600 : 400,
              }}
            >
              更多
            </span>
            {(moreOpen || moreActive) && (
              <span
                className="absolute bottom-1 block w-1 h-1 rounded-full transition-all duration-300"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-hidden="true"
              />
            )}
          </button>

          {/* 更多下拉菜单 */}
          {moreOpen && (
            <div
              ref={moreMenuRef}
              className="absolute bottom-full right-0 mb-2 min-w-[180px] rounded-2xl shadow-lg overflow-hidden animate-[fadeInUp_0.2s_ease-out]"
              role="menu"
              aria-label="更多页面导航"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.12)',
              }}
            >
              {/* 小箭头指向"更多"按钮 */}
              <div
                className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                }}
                aria-hidden="true"
              />
              <ul className="py-1.5" role="list">
                {MORE_TABS.map((tab, index) => {
                  const isActive =
                    tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
                  return (
                    <li key={tab.path} role="none">
                      <NavLink
                        ref={(el) => {
                          moreItemRefs.current[index] = el;
                        }}
                        to={tab.path}
                        end={tab.path === '/'}
                        onClick={handleMoreItemClick}
                        onKeyDown={(e) => handleMenuKeyDown(e, index)}
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-3 transition-colors duration-200 focus-visible:outline-none min-h-[44px]"
                        style={{
                          backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                          color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text)',
                        }}
                        aria-label={tab.label}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span
                          className="flex-shrink-0"
                          style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                          aria-hidden="true"
                        >
                          {tab.icon}
                        </span>
                        <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
                        {isActive && (
                          <span
                            className="ml-auto block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                            aria-hidden="true"
                          />
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
