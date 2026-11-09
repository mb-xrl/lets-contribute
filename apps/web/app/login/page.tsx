import type { Metadata } from 'next';
import { LoginPanel } from '@/components/login-panel';
import { GlassCard } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { getAuthConfig, getSession } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in with GitHub to share opportunities, ideas and discussions.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function safeNext(value: string | undefined): string {
  if (!value) return '/feed';
  return value.startsWith('/') && !value.startsWith('//') ? value : '/feed';
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [config, user] = await Promise.all([getAuthConfig(), getSession()]);
  const next = safeNext(first(params.next));
  const error = first(params.error);

  return (
    <div className="grid gap-10 pt-12 sm:pt-16 lg:grid-cols-[1fr_0.85fr] lg:items-center">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.7rem] text-slate-300">
          <Icon name="shieldCheck" className="h-3.5 w-3.5 text-aurora-mint" />
          One click, no passwords
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-white sm:text-[2.6rem]">
          Sign in and start <span className="text-gradient">contributing</span>
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-dim">
          An account lets you post opportunities, float ideas, reply in discussions and upvote the
          work you want to see happen. Identity comes from GitHub, so the community knows who is
          talking.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: 'gitPullRequest' as const,
              title: 'Post opportunities',
              body: 'Scope the work once, then let people claim it.',
            },
            {
              icon: 'lightbulb' as const,
              title: 'Float ideas',
              body: 'Get feedback before you build alone.',
            },
            {
              icon: 'messages' as const,
              title: 'Join discussions',
              body: 'Decide architecture and process in the open.',
            },
            {
              icon: 'award' as const,
              title: 'Build a record',
              body: 'Your profile lists what you actually shipped.',
            },
          ].map((item) => (
            <GlassCard key={item.title} className="p-4">
              <Icon name={item.icon} className="h-4 w-4 text-aurora-sky" />
              <h3 className="mt-2 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-[0.72rem] leading-relaxed text-faint">{item.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      <div className="animate-rise">
        <LoginPanel config={config} next={next} error={error} user={user} />
      </div>
    </div>
  );
}
