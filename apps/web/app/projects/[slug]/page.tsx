import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostCard } from '@/components/post-card';
import {
  Avatar,
  ButtonLink,
  EmptyState,
  GlassCard,
  Pill,
  TagChip,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { getPosts, getProject, getSession } from '@/lib/api';
import { plural, timeAgo } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project not found' };
  return { title: project.name, description: project.description.slice(0, 160) };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [discussions, user] = await Promise.all([
    getPosts({ project: slug, sort: 'newest', pageSize: 20 }),
    getSession(),
  ]);

  const opportunities = discussions.items.filter((post) => post.type === 'opportunity');
  const threads = discussions.items.filter((post) => post.type !== 'opportunity');

  return (
    <div className="pt-8 sm:pt-10">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-white"
      >
        <Icon name="arrowLeft" className="h-3.5 w-3.5" />
        All projects
      </Link>

      <GlassCard glow className="mt-5 overflow-hidden">
        <div className="relative px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute inset-x-0 -top-28 h-56 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(167,139,250,0.22),transparent_70%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Pill icon="folder" tone="violet">
                  Project
                </Pill>
                <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-faint">
                  <Icon name="clock" className="h-3 w-3" />
                  active {timeAgo(project.lastActivityAt)}
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{project.name}</h1>
              <p className="mt-3 text-sm leading-relaxed text-dim">{project.description}</p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                  <Avatar author={project.owner} size={20} />
                  <span className="text-xs text-slate-300">
                    maintained by{' '}
                    <Link
                      href={`/u/${project.owner.login}`}
                      className="text-slate-100 transition hover:text-aurora-mint"
                    >
                      {project.owner.name}
                    </Link>
                  </span>
                </span>

                {project.tags.map((tag) => (
                  <TagChip key={tag} tag={tag} href={`/feed?tag=${encodeURIComponent(tag)}`} />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <ButtonLink
                href={`/new?type=discussion&project=${project.slug}`}
                size="sm"
                className="h-10"
              >
                <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
                Start a discussion
              </ButtonLink>
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 text-xs font-medium text-slate-100 transition hover:border-white/30 hover:bg-white/[0.09]"
                >
                  <Icon name="github" className="h-3.5 w-3.5" />
                  View repository
                  <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-4">
            {[
              { icon: 'gitPullRequest' as const, label: 'open opportunities', value: opportunities.length },
              { icon: 'messages' as const, label: 'threads', value: project.discussionCount },
              { icon: 'messageSquare' as const, label: 'replies', value: project.commentCount },
              { icon: 'calendar' as const, label: 'started', value: timeAgo(project.createdAt) },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05]">
                  <Icon name={stat.icon} className="h-3.5 w-3.5 text-aurora-sky" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">{stat.value}</div>
                  <div className="text-[0.62rem] uppercase tracking-[0.12em] text-faint">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_0.55fr] lg:items-start">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Icon name="gitPullRequest" className="h-4 w-4 text-aurora-mint" />
              Opportunities
            </h2>
            <ButtonLink
              href={`/new?type=opportunity&project=${project.slug}`}
              variant="ghost"
              size="sm"
            >
              <Icon name="plus" className="h-3.5 w-3.5" />
              Add
            </ButtonLink>
          </div>

          {opportunities.length === 0 ? (
            <EmptyState
              icon="gitPullRequest"
              title="No open opportunities"
              description="Nothing is scoped right now. Ask what they need in the discussions — that is often how the next issue gets written."
              action={
                <ButtonLink href={`/new?type=discussion&project=${project.slug}`} size="sm">
                  <Icon name="messages" className="h-3.5 w-3.5" />
                  Open a thread
                </ButtonLink>
              }
            />
          ) : (
            <div className="grid gap-4">
              {opportunities.map((post) => (
                <PostCard key={post.id} post={post} authed={Boolean(user)} />
              ))}
            </div>
          )}

          <div className="mb-4 mt-10 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Icon name="messages" className="h-4 w-4 text-aurora-violet" />
              Discussions
            </h2>
            <span className="text-xs text-faint">
              {threads.length} {plural(threads.length, 'thread')}
            </span>
          </div>

          {threads.length === 0 ? (
            <EmptyState
              icon="messages"
              title="No discussions yet"
              description="Be the first to ask the awkward architecture question."
            />
          ) : (
            <div className="grid gap-3">
              {threads.map((post) => (
                <PostCard key={post.id} post={post} authed={Boolean(user)} />
              ))}
            </div>
          )}
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-24">
          <GlassCard className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Icon name="handshake" className="h-4 w-4 text-aurora-mint" />
              How to help here
            </h3>
            <ol className="mt-3 grid gap-3 text-xs leading-relaxed text-dim">
              {[
                'Read the pinned thread before proposing a direction.',
                'Comment on an opportunity with your timezone and what you would tackle first.',
                'Ship something small, then write what surprised you.',
              ].map((step, index) => (
                <li key={step} className="flex gap-2.5">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/15 text-[0.6rem] font-semibold text-slate-300">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Icon name="users" className="h-4 w-4 text-aurora-sky" />
              Recent voices
            </h3>
            <div className="mt-3 grid gap-2">
              {Array.from(
                new Map(discussions.items.map((post) => [post.author.id, post.author])).values(),
              )
                .slice(0, 5)
                .map((author) => (
                  <Link
                    key={author.id}
                    href={`/u/${author.login}`}
                    className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-white/[0.05]"
                  >
                    <Avatar author={author} size={26} />
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
                      {author.name}
                    </span>
                    <Icon name="chevronRight" className="h-3.5 w-3.5 text-slate-600" />
                  </Link>
                ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Icon name="tag" className="h-4 w-4 text-aurora-violet" />
              Find by tag
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.length > 0 ? (
                project.tags.map((tag) => (
                  <TagChip key={tag} tag={tag} href={`/feed?tag=${encodeURIComponent(tag)}`} />
                ))
              ) : (
                <span className="text-xs text-faint">No tags yet.</span>
              )}
            </div>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}
