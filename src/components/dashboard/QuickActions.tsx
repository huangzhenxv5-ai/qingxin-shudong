import { useNavigate } from 'react-router-dom';

interface QuickAction {
  path: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  ariaLabel: string;
}

const ACTIONS: QuickAction[] = [
  {
    path: '/chat',
    title: '树洞倾诉',
    subtitle: '和 AI 聊聊心事',
    icon: '🌳',
    gradient: 'linear-gradient(135deg, #5B8A72 0%, #3D6B52 100%)',
    ariaLabel: '进入树洞倾诉',
  },
  {
    path: '/cards',
    title: '卡牌配对',
    subtitle: '学习情绪调节',
    icon: '🃏',
    gradient: 'linear-gradient(135deg, #9B8EC4 0%, #7B6BA8 100%)',
    ariaLabel: '进入卡牌配对',
  },
  {
    path: '/diary',
    title: '情绪日记',
    subtitle: '记录今日心情',
    icon: '📔',
    gradient: 'linear-gradient(135deg, #E8B86B 0%, #D4A05B 100%)',
    ariaLabel: '进入情绪日记',
  },
  {
    path: '/daily-card',
    title: '今日日签',
    subtitle: '生成治愈图片',
    icon: '🎴',
    gradient: 'linear-gradient(135deg, #D4856B 0%, #B56B52 100%)',
    ariaLabel: '进入每日日签',
  },
  {
    path: '/growth',
    title: '成长档案',
    subtitle: '看见情绪轨迹',
    icon: '📈',
    gradient: 'linear-gradient(135deg, #7BAEC4 0%, #5B8FA8 100%)',
    ariaLabel: '进入成长档案',
  },
  {
    path: '/breathing',
    title: '呼吸放松',
    subtitle: '平复心情节奏',
    icon: '🌬️',
    gradient: 'linear-gradient(135deg, #A8C8B5 0%, #7BAE92 100%)',
    ariaLabel: '进入呼吸放松练习',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 mb-4 animate-fade-in-up stagger-4" aria-label="快捷入口">
      <h2
        className="text-lg font-heading font-semibold mb-3"
        style={{ color: 'var(--color-text)' }}
      >
        快捷入口
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {ACTIONS.map((action, idx) => (
          <button
            key={action.path}
            type="button"
            onClick={() => navigate(action.path)}
            aria-label={action.ariaLabel}
            className={`group relative overflow-hidden rounded-3xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.98] focus-visible:outline-none animate-fade-in-up stagger-${idx + 1}`}
            style={{
              background: action.gradient,
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            {/* 装饰光斑 */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 blob-shape transition-transform duration-500 group-hover:scale-125"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
              aria-hidden="true"
            />
            <div
              className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110"
              aria-hidden="true"
            >
              {action.icon}
            </div>
            <h3 className="text-white font-heading font-bold text-base tracking-tight">{action.title}</h3>
            <p className="text-white/80 text-xs mt-0.5">{action.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
