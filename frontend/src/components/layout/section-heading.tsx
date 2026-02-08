import { cn } from '@/lib/utils';

export function SectionHeading({
  title,
  subtitle,
  className
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
