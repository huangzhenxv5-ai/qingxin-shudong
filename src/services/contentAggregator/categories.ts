import { type ContentCategory, type CategoryMeta } from './types';

/**
 * 内容分类元信息
 *
 * 用于前端筛选 Tab、卡片标签、渐变兜底色
 */
export const CATEGORY_META: Record<ContentCategory, CategoryMeta> = {
  emotion: {
    id: 'emotion',
    name: '情绪管理',
    icon: '🌿',
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #A8E6CF 0%, #4ECDC4 100%)',
  },
  growth: {
    id: 'growth',
    name: '成长励志',
    icon: '🌱',
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FFD3A5 0%, #FF9800 100%)',
  },
  relationship: {
    id: 'relationship',
    name: '人际关系',
    icon: '🤝',
    color: '#E91E63',
    gradient: 'linear-gradient(135deg, #FFB6C1 0%, #E91E63 100%)',
  },
  study: {
    id: 'study',
    name: '学习方法',
    icon: '📚',
    color: '#2196F3',
    gradient: 'linear-gradient(135deg, #90CAF9 0%, #2196F3 100%)',
  },
  life: {
    id: 'life',
    name: '生活感悟',
    icon: '☀️',
    color: '#FFC107',
    gradient: 'linear-gradient(135deg, #FFEAA7 0%, #FAB1A0 100%)',
  },
  inspiration: {
    id: 'inspiration',
    name: '灵感短句',
    icon: '✨',
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #CE93D8 0%, #9C27B0 100%)',
  },
};

/** 所有分类列表 */
export const ALL_CATEGORIES: ContentCategory[] = [
  'emotion',
  'growth',
  'relationship',
  'study',
  'life',
  'inspiration',
];
