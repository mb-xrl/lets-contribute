'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { apiFetch } from '@/lib/client';
import { Icon } from './ui/icon';

export function VoteButton({
  postId,
  votes,
  voted,
  authed,
  layout = 'vertical',
}: {
  postId: string;
  votes: number;
  voted: boolean;
  authed: boolean;
  layout?: 'vertical' | 'inline';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState({ votes, voted });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!authed) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (pending) return;

    const previous = state;
    setState((current) => ({
      votes: current.votes + (current.voted ? -1 : 1),
      voted: !current.voted,
    }));
    setPending(true);
    setError(null);

    const result = await apiFetch<{ votes: number; voted: boolean }>(`/posts/${postId}/vote`, {
      method: 'POST',
    });

    if (result.ok) setState(result.data);
    else {
      setState(previous);
      setError(result.error);
    }
    setPending(false);
  }

  const label = state.voted ? 'Remove your upvote' : 'Upvote this post';

  if (layout === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={state.voted}
        title={error ?? label}
        aria-label={label}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition',
          state.voted
            ? 'border-transparent bg-[linear-gradient(100deg,var(--color-aurora-mint),var(--color-aurora-sky))] text-ink-950'
            : 'border-white/12 bg-white/[0.05] text-slate-300 hover:border-white/25 hover:text-white',
        )}
      >
        <Icon name="arrowUp" className="h-3.5 w-3.5" strokeWidth={2.4} />
        {state.votes}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={state.voted}
        aria-label={label}
        title={error ?? label}
        className={cn(
          'group flex h-10 w-10 flex-col items-center justify-center rounded-2xl border transition',
          state.voted
            ? 'border-transparent bg-[linear-gradient(150deg,var(--color-aurora-mint),var(--color-aurora-sky)_55%,var(--color-aurora-violet))] text-ink-950 shadow-[0_10px_24px_-14px_rgba(110,231,208,0.9)]'
            : 'border-white/12 bg-white/[0.05] text-slate-300 hover:-translate-y-0.5 hover:border-white/30 hover:text-white',
        )}
      >
        <Icon
          name="arrowUp"
          className="h-4 w-4 transition group-hover:-translate-y-px"
          strokeWidth={2.4}
        />
      </button>
      <span
        className={cn(
          'text-xs font-semibold tabular-nums',
          state.voted ? 'text-aurora-mint' : 'text-slate-400',
        )}
      >
        {state.votes}
      </span>
    </div>
  );
}
