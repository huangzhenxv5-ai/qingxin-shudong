import { MainLayout } from '@/components/layout/MainLayout';

interface PlaceholderPageProps {
  icon: string;
  title: string;
  description: string;
}

export function PlaceholderPage({ icon, title, description }: PlaceholderPageProps) {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-fade-in">
        <div className="text-6xl mb-6 animate-bounce-slow">{icon}</div>
        <h1 className="text-2xl font-bold text-text mb-3">{title}</h1>
        <p className="text-text-secondary mb-2">{description}</p>
        <p className="text-sm text-text-secondary/60 mt-4 px-4 py-2 bg-primary-light rounded-full">
          🚧 开发中，敬请期待
        </p>
      </div>
    </MainLayout>
  );
}
