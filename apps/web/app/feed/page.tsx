import type { Metadata } from 'next';
import Link from 'next/link';
import { POST_TYPES, SORTS, type PostQuery, type PostType, type Sort } from '@lets-contribute/shared';
import { FeedFilters } from '@/components/feed-filters';
import { PostCard } from '@/components/post-card';
import { ButtonLink, EmptyState, GlassCard, Pill } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { getPosts, getSession, getTags } from '@/lib/api';
import { plural } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The feed',
  description: 'Contribution opportunities, ideas and project discussions from the community.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default async function FeedPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawType = first(params.type);
  const rawSort = first(params.sort);
  const rawPage = Number(first(params.page) ?? '1');

  const type: PostType | 'all' =
    rawType && (POST_TYPES as readonly string[]).includes(rawType) ? (rawType as PostType) : 'all';
  const sort: Sort =
    rawSort && (SORTS as readonly string[]).includes(rawSort) ? (rawSort as Sort) : 'newest';
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const query: PostQuery = {
    type,
    tag: first(params.tag),
    q: first(params.q),
    author: first(params.author),
    sort,
    page,
  };

  const [result, tags, user] = await Promise.all([getPosts(query), getTags(), getSession()]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const heading =
    type === 'opportunity'
      ? 'Open opportunities'
      : type === 'idea'
        ? 'Ideas looking for feedback'
        : type === 'discussion'
          ? 'Project discussions'
          : 'The board';

  const subtitle =
    type === 'opportunity'
      ? 'Work that a maintainer has scoped, labelled and promised to review.'
      : type === 'idea'
        ? 'Unfinished thoughts that get better when someone argues with them.'
        : type === 'discussion'
          ? 'Architecture, licensing, process — the conversations that decide what gets built.'
          : 'Everything the community is sharing right now: opportunities, ideas and open threads.';

  function pageHref(target: number): string {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (query.tag) params.set('tag', query.tag);
    if (query.q) params.set('q', query.q);
    if (query.author) params.set('author', query.author);
    if (sort !== 'newest') params.set('sort', sort);
    if (target > 1) params.set('page', String(target));
    const qs = params.toString();
    return qs ? `/feed?${qs}` : '/feed';
  }

  return (
    <div className="pt-10 sm:pt-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-aurora-mint/80">
            <Icon name="compass" className="h-3.5 w-3.5" />
            Community feed
          </div>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">{heading}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {query.author ? (
            <Pill icon="user" tone="sky">
              by @{query.author}
            </Pill>
          ) : null}
          <ButtonLink href="/new" size="sm" className="h-9 px-4">
            <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
            Share
          </ButtonLink>
        </div>
      </div>

      <FeedFilters
        query={{ type, tag: query.tag, q: query.q, author: query.author, sort }}
        tags={tags}
      />

      <div className="mt-4 flex items-center justify-between text-xs text-faint">
        <span>
          {result.total} {plural(result.total, 'post')}
          {query.q ? (
            <>
              {' '}
              matching <span className="text-slate-300">“{query.q}”</span>
            </>
          ) : null}
          {query.tag ? (
            <>
              {' '}
              tagged <span className="text-slate-300">#{query.tag}</span>
            </>
          ) : null}
        </span>
        <span>
          page {result.page} of {totalPages}
        </span>
      </div>

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState
            icon="compass"
            title="Nothing here yet"
            description="No posts match these filters. Try clearing them, or be the person who starts this part of the board."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <ButtonLink href="/feed" variant="secondary" size="sm">
                  <Icon name="x" className="h-3.5 w-3.5" />
                  Clear filters
                </ButtonLink>
                <ButtonLink href="/new" size="sm">
                  <Icon name="plus" className="h-3.5 w-3.5" />
                  Post something
                </ButtonLink>
              </div>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {result.items.map((post) => (
              <PostCard key={post.id} post={post} authed={Boolean(user)} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between">
          {page > 1 ? (
            <ButtonLink href={pageHref(page - 1)} variant="secondary" size="sm">
              <Icon name="arrowLeft" className="h-3.5 w-3.5" />
              Previous
            </ButtonLink>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((target) => (
              <Link
                key={target}
                href={pageHref(target)}
                className={
                  target === page
                    ? 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.14] text-xs font-semibold text-white'
                    : 'inline-flex h-8 w-8 items-center justify-center rounded-full text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-white'
                }
              >
                {target}
              </Link>
            ))}
          </div>
          {page < totalPages ? (
            <ButtonLink href={pageHref(page + 1)} variant="secondary" size="sm">
              Next
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </ButtonLink>
          ) : (
            <span />
          )}
        </div>
      ) : null}

      <GlassCard className="mt-10 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05]">
            <Icon name="lightbulb" className="h-4 w-4 text-aurora-violet" />
          </span>
          <p className="text-sm text-dim">
            Got something that doesn&apos;t fit? Post it as an idea — half-formed is the point.
          </p>
        </div>
        <ButtonLink href="/new?type=idea" variant="secondary" size="sm">
          Post an idea
          <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </ButtonLink>
      </GlassCard>
    </div>
  );
}
