'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Sort, TagCount } from '@lets-contribute/shared';
import { cn } from '@/lib/cn';
import { Icon, iconForTag, type IconName } from './ui/icon';

export type FeedQuery = {
  type: 'all' | 'opportunity' | 'idea' | 'discussion';
  tag?: string;
  q?: string;
  author?: string;
  sort: Sort;
};

const tabs: { value: FeedQuery['type']; label: string; icon: IconName }[] = [
  { value: 'all', label: 'Everything', icon: 'sparkles' },
  { value: 'opportunity', label: 'Opportunities', icon: 'gitPullRequest' },
  { value: 'idea', label: 'Ideas', icon: 'lightbulb' },
  { value: 'discussion', label: 'Discussions', icon: 'messages' },
];

const sorts: { value: Sort; label: string; icon: IconName }[] = [
  { value: 'newest', label: 'Newest', icon: 'clock' },
  { value: 'top', label: 'Top voted', icon: 'arrowUp' },
  { value: 'discussed', label: 'Most discussed', icon: 'messageSquare' },
];

function buildHref(query: FeedQuery, patch: Partial<FeedQuery>): string {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();
  if (next.type !== 'all') params.set('type', next.type);
  if (next.tag) params.set('tag', next.tag);
  if (next.q) params.set('q', next.q);
  if (next.author) params.set('author', next.author);
  if (next.sort !== 'newest') params.set('sort', next.sort);
  const qs = params.toString();
  return qs ? `/feed?${qs}` : '/feed';
}

export function FeedFilters({ query, tags }: { query: FeedQuery; tags: TagCount[] }) {
  const router = useRouter();
  const [search, setSearch] = useState(query.q ?? '');
  const hasFilters = Boolean(query.tag || query.q || query.author || query.type !== 'all');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildHref(query, { q: search.trim() || undefined }));
  }

  return (
    <div className="glass rounded-3xl p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const active = query.type === tab.value;
            return (
              <Link
                key={tab.value}
                href={buildHref(query, { type: tab.value })}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
                  active
                    ? 'bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100',
                )}
              >
                <Icon name={tab.icon} className="h-3.5 w-3.5 opacity-80" />
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <form onSubmit={submit} className="relative flex-1 lg:w-56 lg:flex-none">
            <span className="sr-only">Search posts</span>
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, tags, bodies…"
              className="h-9 w-full rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 transition focus:border-sky-300/40 focus:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-sky-300/10"
            />
          </form>

          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            {sorts.map((sort) => (
              <Link
                key={sort.value}
                href={buildHref(query, { sort: sort.value })}
                title={sort.label}
                className={cn(
                  'inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[0.7rem] font-medium transition',
                  query.sort === sort.value
                    ? 'bg-white/[0.12] text-white'
                    : 'text-slate-400 hover:text-slate-100',
                )}
              >
                <Icon name={sort.icon} className="h-3 w-3" />
                <span className="hidden sm:inline">{sort.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3">
          <Icon name="tag" className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <div className="-mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tags.slice(0, 14).map((tag) => {
              const active = query.tag === tag.tag;
              return (
                <Link
                  key={tag.tag}
                  href={buildHref(query, { tag: active ? undefined : tag.tag })}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] transition',
                    active
                      ? 'border-transparent bg-white text-ink-950'
                      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white',
                  )}
                >
                  <Icon name={iconForTag(tag.tag)} className="h-3 w-3 opacity-80" />
                  {tag.tag}
                  <span className={active ? 'text-ink-950/60' : 'text-slate-600'}>{tag.count}</span>
                </Link>
              );
            })}
          </div>
          {hasFilters ? (
            <Link
              href="/feed"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[0.7rem] text-slate-400 transition hover:border-white/25 hover:text-white"
            >
              <Icon name="x" className="h-3 w-3" />
              Clear
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
