import Link from 'next/link';
import {
  getContributors,
  getPosts,
  getSession,
  getStats,
  getTags,
} from '@/lib/api';
import { compactNumber, plural, timeAgo } from '@/lib/format';
import { PostCard } from '@/components/post-card';
import { Avatar, ButtonLink, GlassCard, Pill, SectionHeading, TagChip } from '@/components/ui/primitives';
import { Icon, type IconName } from '@/components/ui/icon';

export const dynamic = 'force-dynamic';

const lanes: {
  href: string;
  title: string;
  body: string;
  icon: IconName;
  accent: string;
  countKey: 'opportunities' | 'ideas' | 'discussions';
  cta: string;
}[] = [
  {
    href: '/feed?type=opportunity',
    title: 'Opportunities',
    body: 'Issues that a real maintainer wants closed, with the skills, difficulty and time they actually need.',
    icon: 'gitPullRequest',
    accent: 'from-emerald-300/80 to-teal-200/40',
    countKey: 'opportunities',
    cta: 'Find a first issue',
  },
  {
    href: '/feed?type=idea',
    title: 'Ideas',
    body: 'Half-formed thoughts welcome. Stress-test a concept before you spend a weekend building it alone.',
    icon: 'lightbulb',
    accent: 'from-violet-300/80 to-fuchsia-200/40',
    countKey: 'ideas',
    cta: 'Float an idea',
  },
  {
    href: '/feed?type=discussion',
    title: 'Discussions',
    body: 'Architecture calls, licensing knots, "should we do this at all" threads. The useful arguments.',
    icon: 'messages',
    accent: 'from-sky-300/80 to-cyan-200/40',
    countKey: 'discussions',
    cta: 'Join a thread',
  },
];

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'compass',
    title: 'Find work sized for you',
    body: 'Filter by difficulty, skill or tag. Every opportunity states what you will touch and who reviews it.',
  },
  {
    icon: 'penLine',
    title: 'Say it out loud',
    body: 'Post an idea or ask the awkward question. Maintainers answer in public so the next person finds it.',
  },
  {
    icon: 'gitMerge',
    title: 'Open the pull request',
    body: 'Pair with someone, ship something small, and let the thread be the receipt of how it happened.',
  },
];

export default async function HomePage() {
  const [stats, opportunities, discussions, tags, contributors, user] = await Promise.all([
    getStats(),
    getPosts({ type: 'opportunity', sort: 'top', pageSize: 3 }),
    getPosts({ type: 'discussion', sort: 'discussed', pageSize: 4 }),
    getTags(),
    getContributors(8),
    getSession(),
  ]);

  const apiDown = stats === null;
  const statRows = [
    { icon: 'users' as IconName, label: 'Contributors', value: compactNumber(stats?.contributors ?? 0) },
    { icon: 'gitPullRequest' as IconName, label: 'Open opportunities', value: compactNumber(stats?.opportunities ?? 0) },
    { icon: 'lightbulb' as IconName, label: 'Ideas', value: compactNumber(stats?.ideas ?? 0) },
    { icon: 'messages' as IconName, label: 'Discussions', value: compactNumber(stats?.discussions ?? 0) },
    { icon: 'boxes' as IconName, label: 'Projects', value: compactNumber(stats?.projects ?? 0) },
  ];

  return (
    <div className="pb-10">
      {apiDown ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-100">
          <Icon name="triangleAlert" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            The API isn&apos;t answering yet. Start it with{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.8em]">
              npm run dev:api
            </code>{' '}
            (or set <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.8em]">DATABASE_URL</code>{' '}
            for Neon) and refresh.
          </p>
        </div>
      ) : null}

      {/* ------------------------------------------------------------- hero */}
      <section className="grid gap-8 pt-12 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pt-20">
        <div className="animate-rise">
          <Pill icon="sparkles" tone="mint" className="mb-5">
            A contribution club, not a job board
          </Pill>

          <h1 className="text-[2.1rem] font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Turn curiosity into a{' '}
            <span className="text-gradient">merged pull request</span>.
          </h1>

          <p className="mt-5 max-w-xl text-[0.97rem] leading-relaxed text-dim sm:text-base">
            Share the work that needs doing, the ideas that need pressure-testing, and the
            discussions that decide both. Sign in with GitHub, pick something small, and let the
            community get you unstuck.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href="/feed?type=opportunity" size="lg">
              Browse opportunities
              <Icon name="arrowRight" className="h-4 w-4" strokeWidth={2.2} />
            </ButtonLink>
            <ButtonLink href="/new" variant="secondary" size="lg">
              <Icon name="penLine" className="h-4 w-4" />
              Share something
            </ButtonLink>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-faint">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="github" className="h-3.5 w-3.5" />
              GitHub sign-in
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="shieldCheck" className="h-3.5 w-3.5" />
              No résumés, no recruiters
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="heartHandshake" className="h-3.5 w-3.5" />
              Reviews within a week
            </span>
          </div>
        </div>

        {/* live card */}
        <GlassCard glow className="animate-rise overflow-hidden p-1.5" >
          <div className="rounded-[1.35rem] bg-ink-900/40 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-aurora-mint/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                Live from the feed
              </div>
              <Link
                href="/feed"
                className="text-[0.7rem] text-slate-400 transition hover:text-white"
              >
                See all
              </Link>
            </div>

            <div className="mt-4 grid gap-2">
              {opportunities.items.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-dim">
                  The board is quiet. Be the first to post an opportunity.
                </p>
              ) : (
                opportunities.items.map((post) => (
                  <Link
                    key={post.id}
                    href={`/p/${post.id}`}
                    className="group flex items-start gap-3 rounded-2xl border border-transparent px-3 py-2.5 transition hover:border-white/10 hover:bg-white/[0.05]"
                  >
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                      <Icon
                        name="gitPullRequest"
                        className="h-3.5 w-3.5 text-aurora-mint"
                        strokeWidth={2}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.84rem] font-medium text-slate-200 group-hover:text-white">
                        {post.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.72rem] text-faint">
                        {post.repoName ?? post.project?.name ?? 'Community'} ·{' '}
                        {timeAgo(post.createdAt)}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[0.72rem] font-semibold text-slate-400">
                      <Icon name="arrowUp" className="h-3 w-3" strokeWidth={2.4} />
                      {post.votes}
                    </span>
                  </Link>
                ))
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-4">
              {[
                { label: 'votes cast', value: compactNumber(stats?.votes ?? 0), icon: 'arrowUp' as IconName },
                { label: 'comments', value: compactNumber(stats?.comments ?? 0), icon: 'messageSquare' as IconName },
                { label: 'projects', value: compactNumber(stats?.projects ?? 0), icon: 'boxes' as IconName },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.03] px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[0.72rem] font-semibold text-white">
                    <Icon name={item.icon} className="h-3 w-3 text-aurora-sky" />
                    {item.value}
                  </div>
                  <div className="mt-0.5 text-[0.62rem] uppercase tracking-[0.1em] text-faint">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ------------------------------------------------------------ stats */}
      <section className="mt-12">
        <GlassCard className="flex flex-wrap items-center justify-between gap-6 px-6 py-5">
          {statRows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05]">
                <Icon name={row.icon} className="h-4 w-4 text-aurora-mint" />
              </span>
              <div>
                <div className="text-lg font-semibold leading-none text-white">{row.value}</div>
                <div className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-faint">
                  {row.label}
                </div>
              </div>
            </div>
          ))}
        </GlassCard>
      </section>

      {/* ------------------------------------------------------------ lanes */}
      <section className="mt-16">
        <SectionHeading
          eyebrow="Pick a lane"
          icon="compass"
          title="Three ways to take part"
          description="Different contributions, different rhythms. Start where your energy is today."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {lanes.map((lane) => (
            <GlassCard key={lane.href} hover className="group flex flex-col p-6">
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br ${lane.accent} text-ink-950`}
              >
                <Icon name={lane.icon} className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{lane.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-dim">{lane.body}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-faint">
                  {compactNumber(stats?.[lane.countKey] ?? 0)} live
                </span>
                <Link
                  href={lane.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-200 transition group-hover:text-white"
                >
                  {lane.cta}
                  <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- opportunities */}
      <section className="mt-16">
        <SectionHeading
          eyebrow="Open now"
          icon="gitPullRequest"
          title="Opportunities worth your evening"
          description="Each one has an owner, a scope and a reviewer. Sorted by what the community is voting for."
          action={
            <ButtonLink href="/feed?type=opportunity" variant="secondary" size="sm">
              All opportunities
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </ButtonLink>
          }
        />

        {opportunities.items.length === 0 ? (
          <GlassCard className="px-6 py-12 text-center text-sm text-dim">
            No opportunities posted yet.
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {opportunities.items.map((post) => (
              <PostCard key={post.id} post={post} authed={Boolean(user)} />
            ))}
          </div>
        )}
      </section>

      {/* --------------------------------------------- discussions + sidebar */}
      <section className="mt-16 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <SectionHeading
            eyebrow="Talking it through"
            icon="messages"
            title="Discussions in motion"
            action={
              <ButtonLink href="/feed?type=discussion" variant="ghost" size="sm">
                All threads
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </ButtonLink>
            }
          />

          <div className="grid gap-3">
            {discussions.items.map((post) => (
              <GlassCard key={post.id} hover className="p-5">
                <div className="flex items-center gap-2 text-[0.7rem] text-faint">
                  <Pill icon="messages" tone="sky">
                    Discussion
                  </Pill>
                  {post.project ? (
                    <Link
                      href={`/projects/${post.project.slug}`}
                      className="transition hover:text-slate-200"
                    >
                      {post.project.name}
                    </Link>
                  ) : null}
                  <span className="ml-auto inline-flex items-center gap-1">
                    <Icon name="clock" className="h-3 w-3" />
                    {timeAgo(post.updatedAt)}
                  </span>
                </div>

                <h3 className="mt-2.5 text-base font-semibold leading-snug text-slate-100">
                  <Link href={`/p/${post.id}`} className="transition hover:text-white">
                    {post.title}
                  </Link>
                </h3>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Avatar author={post.author} size={20} />
                    {post.author.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="messageSquare" className="h-3.5 w-3.5 opacity-70" />
                    {post.commentCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="arrowUp" className="h-3.5 w-3.5 opacity-70" />
                    {post.votes}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <aside className="grid content-start gap-4">
          <GlassCard className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Icon name="tag" className="h-4 w-4 text-aurora-violet" />
              Browse by tag
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 12).map((tag) => (
                <TagChip
                  key={tag.tag}
                  tag={tag.tag}
                  href={`/feed?tag=${encodeURIComponent(tag.tag)}`}
                />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Icon name="users" className="h-4 w-4 text-aurora-mint" />
              People to know
            </h3>
            <div className="mt-3 grid gap-1">
              {contributors.slice(0, 6).map((person) => (
                <Link
                  key={person.id}
                  href={`/u/${person.login}`}
                  className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-white/[0.05]"
                >
                  <Avatar author={person} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-slate-200">
                      {person.name}
                    </span>
                    <span className="block truncate text-[0.68rem] text-faint">
                      {person.contributions.posts}{' '}
                      {plural(person.contributions.posts, 'post')} ·{' '}
                      {person.contributions.comments}{' '}
                      {plural(person.contributions.comments, 'reply', 'replies')}
                    </span>
                  </span>
                  <Icon name="chevronRight" className="h-3.5 w-3.5 text-slate-600" />
                </Link>
              ))}
            </div>
          </GlassCard>
        </aside>
      </section>

      {/* ------------------------------------------------------- how it works */}
      <section className="mt-16" id="how-it-works">
        <SectionHeading
          eyebrow="How it works"
          icon="waypoints"
          title="Small, reviewable, done"
          description="The whole loop is designed to end in something merged — not in another starred repository."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <GlassCard key={step.title} className="relative p-6">
              <span className="absolute right-5 top-5 font-mono text-xs text-white/20">
                0{index + 1}
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.05]">
                <Icon name={step.icon} className="h-[18px] w-[18px] text-aurora-sky" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{step.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- final cta */}
      <section className="mt-16">
        <GlassCard glow className="relative overflow-hidden px-6 py-12 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(110,231,208,0.22),transparent_70%)]" />
          <h2 className="relative text-2xl font-semibold text-white sm:text-3xl">
            Someone is waiting on a pull request you could open tonight.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-dim">
            Post the thing you need help with, or claim something small and ship it. Either way, tell
            the community what happened afterwards.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/new" size="lg">
              <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
              Post an opportunity
            </ButtonLink>
            <ButtonLink href="/projects" variant="secondary" size="lg">
              <Icon name="boxes" className="h-4 w-4" />
              Explore projects
            </ButtonLink>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
