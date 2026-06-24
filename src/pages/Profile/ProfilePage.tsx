import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { getUserByUsername } from '@/db/userStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { StatsCard } from '@/components/profile/StatsCard';
import { exportUserData } from '@/utils/dataExport';
import type { User } from '@/types';
import { formatDate } from '@/utils/date';

export function ProfilePage() {
  const navigate = useNavigate();
  const { username, signOut } = useAuth();
  const { showToast } = useToast();
  const { theme, setTheme, highContrast, toggleContrast, largeFont, toggleLargeFont, reducedMotion, toggleReducedMotion } =
    useSettingsStore();

  const [user, setUser] = useState<User | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (username) {
        const u = await getUserByUsername(username);
        if (u) setUser(u);
      }
    };
    loadUser();
  }, [username]);

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  const handleExport = async () => {
    if (!username) return;
    setExporting(true);
    try {
      await exportUserData(username);
      showToast('数据已导出', 'success');
    } catch {
      showToast('导出失败，请稍后再试', 'error');
    } finally {
      setExporting(false);
      setShowExportConfirm(false);
    }
  };

  return (
    <MainLayout>
      {/* 用户信息头部 */}
      <div className="pt-8 pb-4 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 mx-auto"
          style={{ backgroundColor: 'var(--color-primary-light)' }}
          aria-hidden="true"
        >
          {user?.avatar || '🌱'}
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          {user?.nickname || username}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          @{username}
        </p>
      </div>

      {/* 使用统计 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatsCard icon="📖" value={28} label="日记篇数" />
        <StatsCard icon="💬" value={56} label="倾诉次数" color="var(--color-secondary)" />
        <StatsCard icon="🃏" value={12} label="卡牌配对" color="var(--color-warning)" />
      </div>

      {/* 成长档案入口 */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/growth')}
          className="w-full rounded-2xl p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-card) 100%)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-primary)',
          }}
          aria-label="查看我的成长档案"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">📈</span>
            <div className="text-left">
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                我的成长档案
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                情绪趋势 · 成就徽章 · AI 月度小结
              </p>
            </div>
          </div>
          <span style={{ color: 'var(--color-primary)' }} aria-hidden="true">›</span>
        </button>
      </div>

      {/* 账户信息 */}
      <SettingsSection title="账户信息" icon="👤">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>用户名</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{username}</span>
          </div>
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>昵称</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{user?.nickname || '-'}</span>
          </div>
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>注册时间</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {user ? formatDate(new Date(user.createdAt)) : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>最后登录</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {user?.lastLoginAt ? formatDate(new Date(user.lastLoginAt)) : '-'}
            </span>
          </div>
        </div>
      </SettingsSection>

      {/* 主题设置 */}
      <SettingsSection title="主题设置" icon="🎨">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>显示模式</span>
            <div className="flex gap-1" role="radiogroup" aria-label="主题模式">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={theme === mode}
                  aria-label={mode === 'light' ? '浅色模式' : mode === 'dark' ? '深色模式' : '跟随系统'}
                  onClick={() => setTheme(mode)}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus-visible:outline-none min-h-[44px] md:min-h-[32px] whitespace-nowrap"
                  style={{
                    backgroundColor: theme === mode ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: theme === mode ? '#FFFFFF' : 'var(--color-text-secondary)',
                  }}
                >
                  {mode === 'light' ? '☀️ 浅色' : mode === 'dark' ? '🌙 深色' : '💻 系统'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* 无障碍设置 */}
      <SettingsSection title="无障碍设置" icon="♿">
        <div className="space-y-1">
          <A11yToggleRow
            label="高对比度"
            description="提升文字与背景对比度"
            checked={highContrast}
            onChange={toggleContrast}
          />
          <A11yToggleRow
            label="大字号"
            description="文字放大 1.25 倍"
            checked={largeFont}
            onChange={toggleLargeFont}
          />
          <A11yToggleRow
            label="减少动效"
            description="禁用动画与过渡效果"
            checked={reducedMotion}
            onChange={toggleReducedMotion}
          />
        </div>
      </SettingsSection>

      {/* 数据管理 */}
      <SettingsSection title="数据管理" icon="📦">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowExportConfirm(true)}
            className="w-full flex items-center justify-between py-3 px-2 rounded-xl transition-colors focus-visible:outline-none"
            style={{ color: 'var(--color-text)' }}
            aria-label="导出我的数据"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true">📤</span>
              <span className="text-sm">导出数据</span>
            </span>
            <span style={{ color: 'var(--color-text-hint)' }} aria-hidden="true">›</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-between py-3 px-2 rounded-xl transition-colors focus-visible:outline-none"
            style={{ color: 'var(--color-text)' }}
            aria-label="导入数据"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true">📥</span>
              <span className="text-sm">导入数据</span>
            </span>
            <span style={{ color: 'var(--color-text-hint)' }} aria-hidden="true">›</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="w-full flex items-center justify-between py-3 px-2 rounded-xl transition-colors focus-visible:outline-none"
            style={{ color: 'var(--color-text)' }}
            aria-label="隐私设置"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true">🔒</span>
              <span className="text-sm">隐私设置</span>
            </span>
            <span style={{ color: 'var(--color-text-hint)' }} aria-hidden="true">›</span>
          </button>
        </div>
      </SettingsSection>

      {/* 关于 */}
      <SettingsSection title="关于" icon="ℹ️">
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>版本</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>v0.1.0</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>数据存储</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>本地 IndexedDB</span>
          </div>
        </div>
      </SettingsSection>

      {/* 退出登录 */}
      <div className="mb-8">
        {!showLogoutConfirm ? (
          <Button variant="secondary" onClick={() => setShowLogoutConfirm(true)}>
            退出登录
          </Button>
        ) : (
          <Card className="border-2" >
            <p className="text-center mb-4" style={{ color: 'var(--color-text)' }}>
              确定要退出登录吗？
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
                取消
              </Button>
              <Button variant="danger" onClick={handleLogout}>
                确认退出
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* 底部寄语 */}
      <div className="text-center pb-4">
        <p className="text-xs" style={{ color: 'var(--color-text-hint)' }}>
          青心树洞 · 让每一颗年轻的心都有安全的倾诉角落 💚
        </p>
      </div>

      {/* 导出确认弹窗 */}
      <Modal open={showExportConfirm} onClose={() => setShowExportConfirm(false)} title="导出数据" size="sm">
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          将你的所有数据（日记、对话记录、游戏数据、情绪日签等）导出为 JSON 文件，保存到本地。密码等敏感信息已脱敏。
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowExportConfirm(false)}>
            取消
          </Button>
          <Button onClick={handleExport} loading={exporting}>
            确认导出
          </Button>
        </div>
      </Modal>

      {/* 隐私设置弹窗 */}
      <Modal open={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="隐私设置" size="sm">
        <div className="space-y-1">
          <A11yToggleRow
            label="阅后即焚"
            description="对话记录阅读后自动删除"
            checked={false}
            onChange={() => {}}
          />
          <A11yToggleRow
            label="数据保留 90 天"
            description="超过 90 天的记录自动清理"
            checked={true}
            onChange={() => {}}
          />
        </div>
        <div className="mt-4">
          <Button fullWidth onClick={() => setShowPrivacyModal(false)}>
            完成
          </Button>
        </div>
      </Modal>
    </MainLayout>
  );
}

interface A11yToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function A11yToggleRow({ label, description, checked, onChange }: A11yToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex-1 pr-4">
        <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus-visible:outline-none min-w-[44px] min-h-[44px] md:min-h-[28px] md:min-w-[48px]"
        style={{
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
        }}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
