import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn('relative w-[80px] h-8 lg:w-[105px] lg:h-10', className)}>
      <Image
        src="/images/logo-text-black.png"
        alt="Al-Ghazel Logo"
        fill
        className="object-contain dark:hidden"
        priority
      />
      <Image
        src="/images/logo-text-white.png"
        alt="Al-Ghazel Logo"
        fill
        className="object-contain hidden dark:block"
        priority
      />
    </div>
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}
