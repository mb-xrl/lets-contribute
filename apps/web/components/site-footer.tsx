import Link from 'next/link';
import { Icon } from './ui/icon';

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.07] bg-ink-950/40 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07]">
              <Icon name="gitPullRequest" className="h-[18px] w-[18px] text-aurora-mint" strokeWidth={2} />
            </span>
            <span className="text-sm font-semibold text-slate-100">
              let&apos;s <span className="text-gradient">contribute</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-dim">
            A community board for open-source work: opportunities you can actually pick up, ideas
            worth building, and the discussions that turn both into merged pull requests.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[0.7rem] text-faint">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
              <Icon name="braces" className="h-3.5 w-3.5" />
              NestJS
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
              <Icon name="triangle" className="h-3.5 w-3.5" />
              Next.js
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
              <Icon name="database" className="h-3.5 w-3.5" />
              Neon Postgres
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
              <Icon name="triangle" className="h-3.5 w-3.5" />
              Vercel
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-faint">
            Explore
          </h4>
          <ul className="mt-3 grid gap-2 text-sm">
            {[
              { href: '/feed', label: 'The feed' },
              { href: '/feed?type=opportunity', label: 'Open opportunities' },
              { href: '/feed?type=idea', label: 'Ideas' },
              { href: '/feed?type=discussion', label: 'Discussions' },
              { href: '/projects', label: 'Projects' },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-dim transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-faint">
            Contribute
          </h4>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>
              <Link href="/new" className="text-dim transition hover:text-white">
                Share an opportunity
              </Link>
            </li>
            <li>
              <Link href="/new?type=idea" className="text-dim transition hover:text-white">
                Post an idea
              </Link>
            </li>
            <li>
              <Link href="/new?type=discussion" className="text-dim transition hover:text-white">
                Start a discussion
              </Link>
            </li>
            <li>
              <Link href="/projects" className="text-dim transition hover:text-white">
                Add your project
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 border-t border-white/[0.06] px-4 py-6 text-xs text-faint sm:flex-row sm:items-center sm:px-6">
        <p>Built in the open. Every glyph is a component from one icon registry.</p>
        <p className="inline-flex items-center gap-1.5">
          <Icon name="heartHandshake" className="h-3.5 w-3.5" />
          Be kind. Review generously. Ship small.
        </p>
      </div>
    </footer>
  );
}
