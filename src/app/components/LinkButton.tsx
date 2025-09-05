'use client';

import Link from 'next/link';

type ButtonVariant = 'primary' | 'success' | 'neutral';
type ButtonSize = 'sm' | 'md' | 'lg';

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export default function LinkButton({
  href,
  children,
  isActive = false,
  variant = 'primary',
  size = 'md',
  className = '',
}: LinkButtonProps) {
  const base = 'inline-flex items-center justify-center rounded font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1 text-sm'
      : size === 'lg'
      ? 'px-5 py-2 text-base'
      : 'px-4 py-1.5 text-sm';

  const variantClasses = (() => {
    if (variant === 'success') {
      return isActive ? 'bg-green-800 text-white' : 'bg-green-700 hover:bg-green-800 text-white';
    }
    if (variant === 'neutral') {
      return isActive ? 'bg-gray-800 text-white' : 'bg-gray-700 hover:bg-gray-800 text-white';
    }
    // primary
    return isActive ? 'bg-blue-800 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white';
  })();

  const ringClasses =
    variant === 'success'
      ? 'focus-visible:ring-green-500'
      : variant === 'neutral'
      ? 'focus-visible:ring-gray-500'
      : 'focus-visible:ring-blue-500';

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={[base, sizeClasses, variantClasses, ringClasses, className].join(' ')}
    >
      {children}
    </Link>
  );
}


