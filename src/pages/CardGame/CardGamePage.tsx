import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useCardGame } from '@/hooks/useCardGame';
import { TOTAL_PAIRS } from '@/constants/cards';
import { CardMatchingGame } from './CardMatchingGame';
import { AchievementList } from './AchievementList';
import type { Achievement } from '@/types/card';

export function CardGamePage() {
  const { showToast } = useToast();
  const game = useCardGame();
  const {
    gameState,
    totalGames,
    games,
    startGame,
    finishGame,
    exitGame,
    clearAffirmation,
  } = game;

  const [showVictory, setShowVictory] = useState(false);

  // 游戏完成时弹出胜利弹窗
  useEffect(() => {
    if (gameState.isComplete) {
      setShowVictory(true);
    }
  }, [gameState.isComplete]);

  // 计算成就
  const achievements: Achievement[] = [
    {
      id: 'a-first-match',
      name: '初次配对',
      description: '完成第一局卡牌配对',
      icon: '🎯',
      unlocked: totalGames >= 1,
      unlockedAt: games[0]?.completedAt,
    },
    {
      id: 'a-quick-match',
      name: '快速配对',
      description: '60 秒内完成一局',
      icon: '⚡',
      unlocked: games.some((g) => g.duration <= 60),
    },
    {
      id: 'a-precise-match',
      name: '精准配对',
      description: '12 步以内完成一局',
      icon: '🎯',
      unlocked: games.some((g) => g.moves <= 12),
    },
    {
      id: 'a-all-emotions',
      name: '全情绪大师',
      description: '完成所有情绪卡牌配对',
      icon: '👑',
      unlocked: games.some((g) => g.matchedPairs >= TOTAL_PAIRS),
    },
    {
      id: 'a-practitioner',
      name: '坚持练习',
      description: '累计完成 5 局',
      icon: '🌟',
      unlocked: totalGames >= 5,
    },
    {
      id: 'a-encyclopedia',
      name: '情绪百科',
      description: '累计完成 10 局',
      icon: '📚',
      unlocked: totalGames >= 10,
    },
  ];

  // 胜利后确认
  const handleVictoryConfirm = async () => {
    await finishGame();
    setShowVictory(false);
    showToast('配对完成！已记录到你的成长档案', 'success');
  };

  // 退出游戏
  const handleExitGame = () => {
    exitGame();
    setShowVictory(false);
    clearAffirmation();
  };

  // 格式化用时
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 计算最终用时
  const finalDuration =
    gameState.startTime && gameState.isComplete
      ? Math.floor((Date.now() - gameState.startTime) / 1000)
      : 0;

  return (
    <MainLayout>
      {/* 页面标题 */}
      <div className="px-4 pt-6 pb-2">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text)' }}
        >
          🃏 情绪卡牌配对
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          翻开卡牌，将情绪与应对策略配对，学习情绪调节技巧
        </p>
      </div>

      {/* 桌面端：左右两栏布局 */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 px-4 pb-4">
        {/* 左侧：游戏区（占 2 列） */}
        <div className="lg:col-span-2 space-y-4">
          {!gameState.isPlaying && !gameState.isComplete ? (
            /* 开始游戏界面 */
            <div
              className="rounded-2xl p-6 space-y-4"
              style={{
                backgroundColor: 'var(--color-card)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3"
                  style={{ backgroundColor: 'var(--color-primary-light)' }}
                  aria-hidden="true"
                >
                  🃏
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  情绪卡牌配对
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  翻开卡牌，找到每张「情绪卡」对应的「应对策略卡」。
                  在配对中学习情绪调节技巧，完成所有配对即可获胜！
                </p>
              </div>

              {/* 卡牌预览 */}
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  📋 游戏规则
                </p>
                <ul
                  className="text-xs space-y-1.5 leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <li>• 共 {TOTAL_PAIRS} 对 {TOTAL_PAIRS * 2} 张卡牌，背面朝上排列</li>
                  <li>• 每次翻开两张卡牌，情绪卡与策略卡配对成功则消除</li>
                  <li>• 配对失败则翻回，记住卡牌位置是关键</li>
                  <li>• 完成所有配对即可获胜，挑战更少步数和更短时间</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={startGame}
                className="w-full py-3 rounded-xl font-medium transition-all duration-200 active:scale-[0.98]"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  color: '#FFFFFF',
                }}
              >
                🚀 开始配对
              </button>
            </div>
          ) : (
            /* 游戏进行中或完成 */
            <>
              <div
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: 'var(--color-card)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-base font-bold"
                    style={{ color: 'var(--color-text)' }}
                  >
                    🃏 卡牌配对中
                  </h3>
                  <button
                    type="button"
                    onClick={handleExitGame}
                    className="text-xs px-4 py-2 rounded-full transition-colors min-h-[44px] md:min-h-[36px]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-secondary)',
                    }}
                    aria-label="退出游戏"
                  >
                    退出游戏
                  </button>
                </div>
                <CardMatchingGame game={game} />
              </div>
            </>
          )}
        </div>

        {/* 右侧：成就（桌面端） */}
        <aside className="hidden lg:flex lg:flex-col gap-4">
          <AchievementList achievements={achievements} />
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              backgroundColor: 'var(--color-card)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p
              className="text-3xl font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              {totalGames}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              累计完成局数
            </p>
          </div>
          {/* 最佳记录 */}
          {games.length > 0 && (
            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'var(--color-card)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h3
                className="text-sm font-bold mb-3"
                style={{ color: 'var(--color-text)' }}
              >
                🏅 最佳记录
              </h3>
              <div className="space-y-2">
                <div
                  className="flex items-center justify-between text-xs"
                  >
                  <span style={{ color: 'var(--color-text-secondary)' }}>最少步数</span>
                  <span
                    className="font-bold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {Math.min(...games.map((g) => g.moves))} 步
                  </span>
                </div>
                <div
                  className="flex items-center justify-between text-xs"
                >
                  <span style={{ color: 'var(--color-text-secondary)' }}>最短用时</span>
                  <span
                    className="font-bold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {formatTime(Math.min(...games.map((g) => g.duration)))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* 移动端：成就放在底部 */}
        <div className="lg:hidden space-y-4 mt-4">
          <AchievementList achievements={achievements} />
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              backgroundColor: 'var(--color-card)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p
              className="text-3xl font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              {totalGames}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              累计完成局数
            </p>
          </div>
        </div>
      </div>

      {/* 胜利庆祝弹窗 */}
      <Modal
        open={showVictory}
        onClose={() => {
          /* 不允许点击遮罩关闭 */
        }}
        closeOnOverlayClick={false}
        title="🎉 配对完成！"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div
            className="text-6xl py-2"
            style={{ fontSize: '4rem', lineHeight: 1 }}
            aria-hidden="true"
          >
            🎉
          </div>

          {/* 完成统计 */}
          <div
            className="grid grid-cols-2 gap-3 py-2"
          >
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                {gameState.moves}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                总步数
              </p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                {formatTime(finalDuration)}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                用时
              </p>
            </div>
          </div>

          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            你成功完成了所有情绪卡牌配对！在配对中学习情绪调节技巧，每一次练习都是成长。
          </p>

          <button
            type="button"
            onClick={handleVictoryConfirm}
            className="w-full py-3 rounded-xl font-medium transition-all duration-200 active:scale-[0.98]"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              color: '#FFFFFF',
            }}
          >
            收下奖励
          </button>
        </div>
      </Modal>
    </MainLayout>
  );
}
