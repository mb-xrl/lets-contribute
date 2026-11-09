import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Author, Difficulty, PostType } from '@lets-contribute/shared';
import { cn } from '@/lib/cn';
import { gradientFor, initials } from '@/lib/format';
import {
  Icon,
  difficultyIcon,
  iconForTag,
  postTypeIcon,
  postTypeLabel,
  type IconName,
} from './icon';

/* -------------------------------------------------------------------- buttons */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const baseButton =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 select-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[linear-gradient(100deg,var(--color-aurora-mint),var(--color-aurora-sky)_42%,var(--color-aurora-violet))] text-ink-950 font-semibold shadow-[0_16px_40px_-18px_rgba(125,211,252,0.75)] hover:brightness-110 active:brightness-95',
  secondary:
    'glass-soft text-slate-100 hover:border-white/25 hover:bg-white/[0.09] hover:text-white',
  ghost: 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
  danger:
    'border border-rose-400/25 bg-rose-500/10 text-rose-200 hover:border-rose-300/40 hover:bg-rose-500/20',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3.5 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-[0.95rem]',
};

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return cn(baseButton, variants[variant], sizes[size]);
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button className={cn(buttonClass(variant, size), className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children'>) {
  return (
    <Link href={href} className={cn(buttonClass(variant, size), className)} {...rest}>
      {children}
    </Link>
  );
}

/* --------------------------------------------------------------------- pills */

export function Pill({
  children,
  icon,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  icon?: IconName;
  tone?: 'neutral' | 'mint' | 'violet' | 'sky' | 'amber' | 'rose';
  className?: string;
}) {
  const tones = {
    neutral: 'border-white/12 bg-white/[0.055] text-slate-300',
    mint: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200',
    violet: 'border-violet-300/25 bg-violet-400/10 text-violet-200',
    sky: 'border-sky-300/25 bg-sky-400/10 text-sky-200',
    amber: 'border-amber-300/25 bg-amber-400/10 text-amber-200',
    rose: 'border-rose-300/25 bg-rose-400/10 text-rose-200',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {icon ? <Icon name={icon} className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}

const typeTone: Record<PostType, 'mint' | 'violet' | 'sky'> = {
  opportunity: 'mint',
  idea: 'violet',
  discussion: 'sky',
};

export function TypeChip({ type, className }: { type: PostType; className?: string }) {
  return (
    <Pill icon={postTypeIcon[type]} tone={typeTone[type]} className={className}>
      {postTypeLabel[type]}
    </Pill>
  );
}

const difficultyTone: Record<Difficulty, 'mint' | 'sky' | 'rose'> = {
  beginner: 'mint',
  intermediate: 'sky',
  advanced: 'rose',
};

export function DifficultyChip({ difficulty }: { difficulty: Difficulty }) {
  return (
    <Pill icon={difficultyIcon[difficulty] ?? 'sprout'} tone={difficultyTone[difficulty]}>
      {difficulty[0].toUpperCase() + difficulty.slice(1)}
    </Pill>
  );
}

export function TagChip({
  tag,
  href,
  active,
  className,
}: {
  tag: string;
  href?: string;
  active?: boolean;
  className?: string;
}) {
  const content = (
    <>
      <Icon name={iconForTag(tag)} className="h-3.5 w-3.5 opacity-80" />
      <span className="truncate">{tag}</span>
    </>
  );

  const classes = cn(
    'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition',
    active
      ? 'border-transparent bg-white/90 text-ink-950'
      : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white',
    className,
  );

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  );
}

/* -------------------------------------------------------------------- avatar */

export function Avatar({
  author,
  size = 36,
  className,
}: {
  author: Pick<Author, 'name' | 'login' | 'avatarUrl'>;
  size?: number;
  className?: string;
}) {
  const gradient = gradientFor(author.login || author.name);

  if (author.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.avatarUrl}
        alt={author.name}
        width={size}
        height={size}
        loading="lazy"
        className={cn('rounded-full object-cover ring-1 ring-white/20', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-ink-950 ring-1 ring-white/20',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: gradient,
        fontSize: Math.max(10, size * 0.36),
      }}
    >
      {initials(author.name || author.login)}
    </span>
  );
}

/* ------------------------------------------------------------------ surfaces */

export function GlassCard({
  children,
  className,
  hover,
  glow,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        'glass rounded-3xl',
        hover && 'glass-hover',
        glow && 'glow-ring',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  icon,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-aurora-mint/80">
            {icon ? <Icon name={icon} className="h-3.5 w-3.5" /> : null}
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-2xl font-semibold text-white sm:text-[1.7rem]">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-relaxed text-dim">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon = 'compass',
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass-soft flex flex-col items-center justify-center rounded-3xl px-6 py-14 text-center">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06]">
        <Icon name={icon} className="h-5 w-5 text-aurora-sky" />
      </span>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-dim">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatTile({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05]">
        <Icon name={icon} className="h-4 w-4 text-aurora-mint" />
      </span>
      <div>
        <div className="text-lg font-semibold leading-none text-white">{value}</div>
        <div className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-faint">{label}</div>
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Icon name="loader" className={cn('h-4 w-4 animate-spin', className)} />;
}
