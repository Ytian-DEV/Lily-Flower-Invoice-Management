import { LogoPlaceholder } from '@/components/layout/LogoPlaceholder';
import { Spinner } from '@/components/ui/Spinner';

export interface LoadingScreenProps {
  text?: string;
}

export function LoadingScreen({ text = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen animate-pulse flex-col items-center justify-center bg-background p-6 text-center">
      <LogoPlaceholder />
      <Spinner size="lg" className="mt-6 text-primary" />
      <p className="mt-4 text-sm font-medium text-muted">{text}</p>
    </div>
  );
}
