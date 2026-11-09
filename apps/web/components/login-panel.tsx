'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AuthConfig, PublicUser } from '@lets-contribute/shared';
import { apiFetch } from '@/lib/client';
import { Button, GlassCard, Spinner } from './ui/primitives';
import { Icon } from './ui/icon';

export function LoginPanel({
  config,
  next,
  error,
  user,
}: {
  config: AuthConfig;
  next: string;
  error?: string;
  user: PublicUser | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(error ?? null);

  async function demoLogin() {
    setPending(true);
    setFailure(null);
    const result = await apiFetch<{ user: PublicUser }>('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ next }),
    });
    setPending(false);
    if (result.ok) {
      router.push(next);
      router.refresh();
    } else {
      setFailure(result.error);
    }
  }

  if (user) {
    return (
      <GlassCard glow className="p-7 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10">
          <Icon name="check" className="h-5 w-5 text-emerald-300" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-white">You&apos;re already signed in</h2>
        <p className="mt-1.5 text-sm text-dim">
          Signed in as <span className="text-slate-200">{user.name}</span> (@{user.login}).
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <a
            href={next}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[linear-gradient(100deg,var(--color-aurora-mint),var(--color-aurora-sky)_45%,var(--color-aurora-violet))] px-5 text-sm font-semibold text-ink-950 transition hover:brightness-110"
          >
            Continue
            <Icon name="arrowRight" className="h-4 w-4" />
          </a>
          <a
            href={`/u/${user.login}`}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-5 text-sm text-slate-100 transition hover:border-white/30"
          >
            <Icon name="user" className="h-4 w-4" />
            Your profile
          </a>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow className="p-7">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07]">
          <Icon name="gitPullRequest" className="h-5 w-5 text-aurora-mint" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">Join with GitHub</h2>
          <p className="text-xs text-faint">Takes one click. No email, no password.</p>
        </div>
      </div>

      {failure ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          <Icon name="triangleAlert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {failure === 'cancelled'
            ? 'Sign-in was cancelled. Try again when you are ready.'
            : failure}
        </p>
      ) : null}

      <div className="mt-5 grid gap-2">
        {config.github ? (
          <a
            href={`/api/auth/github?next=${encodeURIComponent(next)}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,var(--color-aurora-mint),var(--color-aurora-sky)_45%,var(--color-aurora-violet))] px-5 text-sm font-semibold text-ink-950 transition hover:brightness-110"
          >
            <Icon name="github" className="h-4 w-4" />
            Continue with GitHub
          </a>
        ) : null}

        {config.demo ? (
          <Button
            type="button"
            variant={config.github ? 'secondary' : 'primary'}
            onClick={demoLogin}
            disabled={pending}
            className="h-11 w-full text-sm"
          >
            {pending ? <Spinner /> : <Icon name="sparkles" className="h-4 w-4" />}
            {config.github ? 'Explore with a demo account' : 'Continue with the demo account'}
          </Button>
        ) : null}

        {!config.github && !config.demo ? (
          <p className="rounded-xl border border-amber-300/25 bg-amber-400/[0.07] px-3 py-2 text-xs text-amber-100">
            Neither GitHub OAuth nor demo sign-in is enabled. Set GITHUB_CLIENT_ID and
            GITHUB_CLIENT_SECRET (or DEMO_AUTH=on) to enable sign-in.
          </p>
        ) : null}
      </div>

      {!config.github && config.demo ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[0.7rem] leading-relaxed text-dim">
          <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aurora-sky" />
          GitHub OAuth is not configured on this deployment, so the demo account is enabled. Add
          <code className="mx-1 rounded bg-white/10 px-1 py-0.5 font-mono text-[0.9em]">
            GITHUB_CLIENT_ID
          </code>
          and
          <code className="mx-1 rounded bg-white/10 px-1 py-0.5 font-mono text-[0.9em]">
            GITHUB_CLIENT_SECRET
          </code>
          to switch to real sign-in.
        </p>
      ) : null}

      <ul className="mt-5 grid gap-2 border-t border-white/[0.07] pt-4 text-[0.72rem] text-dim">
        {[
          { icon: 'shieldCheck' as const, text: 'We read your public profile only — name, avatar, bio.' },
          { icon: 'lock' as const, text: 'No repository access, no email scope, no write permissions.' },
          { icon: 'clock' as const, text: 'A signed, http-only cookie keeps you signed in for 30 days.' },
        ].map((item) => (
          <li key={item.text} className="flex items-start gap-2">
            <Icon name={item.icon} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aurora-mint" />
            {item.text}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-[0.66rem] text-faint">
        Data lives in {config.store === 'postgres' ? 'Neon Postgres' : 'an in-memory store (demo)'}.
      </p>
    </GlassCard>
  );
}
