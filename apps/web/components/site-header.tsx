'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { PublicUser } from '@lets-contribute/shared';
import { cn } from '@/lib/cn';
import { apiFetch } from '@/lib/client';
import { Icon } from './ui/icon';
import { Avatar, buttonClass } from './ui/primitives';

const navItems: {
  href: string;
  label: string;
  icon: 'compass' | 'gitPullRequest' | 'boxes';
  /** Query-only shortcuts never own the active state — their page does. */
  filterOnly?: boolean;
}[] = [
  { href: '/feed', label: 'Feed', icon: 'compass' },
  { href: '/feed?type=opportunity', label: 'Opportunities', icon: 'gitPullRequest', filterOnly: true },
  { href: '/projects', label: 'Projects', icon: 'boxes' },
];

export function SiteHeader({ user }: { user: PublicUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setUserMenuOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/feed?q=${encodeURIComponent(trimmed)}` : '/feed');
    setMenuOpen(false);
  }

  async function signOut() {
    setSigningOut(true);
    await apiFetch('/auth/logout', { method: 'POST' });
    setSigningOut(false);
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  }

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.filterOnly) return false;
    const base = item.href.split('?')[0];
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-ink-950/55 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition group-hover:border-white/30">
            <Icon name="gitPullRequest" className="h-[18px] w-[18px] text-aurora-mint" strokeWidth={2} />
          </span>
          <span className="hidden text-[0.97rem] font-semibold tracking-tight text-slate-100 sm:block">
            let&apos;s <span className="text-gradient">contribute</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition',
                isActive(item)
                  ? 'bg-white/[0.09] text-white'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100',
              )}
            >
              <Icon name={item.icon} className="h-3.5 w-3.5 opacity-80" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={submitSearch} className="hidden lg:block">
            <label className="relative block">
              <span className="sr-only">Search contributions</span>
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the feed…"
                className="h-9 w-56 rounded-full border border-white/10 bg-white/[0.045] pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:w-64 focus:border-sky-300/40 focus:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-sky-300/10"
              />
            </label>
          </form>

          {user ? (
            <>
              <Link href="/new" className={cn(buttonClass('primary', 'sm'), 'h-9 px-4')}>
                <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
                <span className="hidden sm:inline">Share</span>
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 pr-2 transition hover:border-white/25"
                >
                  <Avatar author={user} size={28} />
                  <Icon name="chevronDown" className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userMenuOpen ? (
                  <>
                    <button
                      type="button"
                      aria-hidden
                      tabIndex={-1}
                      onClick={() => setUserMenuOpen(false)}
                      className="fixed inset-0 z-10 cursor-default"
                    />
                    <div
                      role="menu"
                      className="glass-strong absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl p-1.5"
                    >
                      <div className="border-b border-white/[0.08] px-3 py-2.5">
                        <div className="truncate text-sm font-medium text-white">{user.name}</div>
                        <div className="truncate text-xs text-faint">@{user.login}</div>
                        {user.isDemo ? (
                          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/10 px-2 py-0.5 text-[0.65rem] text-amber-200">
                            <Icon name="info" className="h-3 w-3" />
                            Demo session
                          </div>
                        ) : null}
                      </div>

                      <Link
                        href={`/u/${user.login}`}
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <Icon name="user" className="h-4 w-4 opacity-75" />
                        Your profile
                      </Link>
                      <Link
                        href="/new"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <Icon name="penLine" className="h-4 w-4 opacity-75" />
                        Share something
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={signOut}
                        disabled={signingOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-60"
                      >
                        <Icon name="logOut" className="h-4 w-4 opacity-75" />
                        {signingOut ? 'Signing out…' : 'Sign out'}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonClass('secondary', 'sm'), 'h-9')}>
                Sign in
              </Link>
              <Link href="/login?next=/new" className={cn(buttonClass('primary', 'sm'), 'h-9 px-4')}>
                <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
                <span className="hidden sm:inline">Share</span>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/25 hover:text-white md:hidden"
          >
            <Icon name={menuOpen ? 'x' : 'menu'} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/[0.07] bg-ink-950/85 px-4 pb-5 pt-3 backdrop-blur-xl md:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <label className="relative block">
              <span className="sr-only">Search contributions</span>
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the feed…"
                className="field pl-9"
              />
            </label>
          </form>
          <div className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <Icon name={item.icon} className="h-4 w-4 opacity-80" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/feed?sort=top"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Icon name="trendingUp" className="h-4 w-4 opacity-80" />
              Top this month
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
