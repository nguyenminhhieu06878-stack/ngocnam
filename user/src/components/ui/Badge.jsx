import { cn } from '../../lib/utils';

export default function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
    outline: 'border border-gray-300 text-gray-700',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
