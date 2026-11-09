import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommentSection } from '@/components/comment-section';
import { Markdown } from '@/components/markdown';
import { PostActions } from '@/components/post-actions';
import { VoteButton } from '@/components/vote-button';
import {
  Avatar,
  ButtonLink,
  DifficultyChip,
  GlassCard,
  Pill,
  TagChip,
  TypeChip,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { getComments, getPost, getSession, getUser } from '@/lib/api';
import { compactNumber, plural, timeAgo } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.title,
    description: post.body.slice(0, 160),
    openGraph: { title: post.title, description: post.body.slice(0, 160), type: 'article' },
  };
}

export default async function PostDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const [comments, user] = await Promise.all([getComments(id), getSession()]);
  const authorProfile = await getUser(post.author.login);

  const postedLabel = new Date(post.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="pt-8 sm:pt-10">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-white"
      >
        <Icon name="arrowLeft" className="h-3.5 w-3.5" />
        Back to the feed
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.55fr_0.45fr] lg:items-start">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            <TypeChip type={post.type} />
            {post.difficulty ? <DifficultyChip difficulty={post.difficulty} /> : null}
            {post.project ? (
              <Link
                href={`/projects/${post.project.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.7rem] font-medium text-slate-300 transition hover:border-white/25 hover:text-white"
              >
                <Icon name="folder" className="h-3.5 w-3.5 opacity-80" />
                {post.project.name}
              </Link>
            ) : null}
            <span className="ml-auto inline-flex items-center gap-1.5 text-[0.7rem] text-faint">
              <Icon name="clock" className="h-3 w-3" />
              posted {timeAgo(post.createdAt)}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-[2.1rem]">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <VoteButton
                postId={post.id}
                votes={post.votes}
                voted={post.viewerVoted}
                authed={Boolean(user)}
                layout="inline"
              />
              <span className="text-xs text-faint">
                {compactNumber(post.votes)} {plural(post.votes, 'upvote')} ·{' '}
                {post.commentCount} {plural(post.commentCount, 'reply', 'replies')}
              </span>
            </div>
            <PostActions
              postId={post.id}
              isAuthor={post.viewerIsAuthor}
              url={`${(process.env.WEB_ORIGIN || 'http://localhost:3000').replace(/\/$/, '')}/p/${post.id}`}
            />
          </div>

          <GlassCard className="mt-5 p-6 sm:p-8">
            <Markdown content={post.body} />
          </GlassCard>

          {post.tags.length > 0 || post.skills.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {post.tags.length > 0 ? (
                <GlassCard className="p-4">
                  <div className="mb-2.5 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint">
                    <Icon name="tag" className="h-3.5 w-3.5" />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <TagChip key={tag} tag={tag} href={`/feed?tag=${encodeURIComponent(tag)}`} />
                    ))}
                  </div>
                </GlassCard>
              ) : null}

              {post.skills.length > 0 ? (
                <GlassCard className="p-4">
                  <div className="mb-2.5 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint">
                    <Icon name="braces" className="h-3.5 w-3.5" />
                    Skills in play
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {post.skills.map((skill) => (
                      <Pill key={skill} icon="zap">
                        {skill}
                      </Pill>
                    ))}
                  </div>
                </GlassCard>
              ) : null}
            </div>
          ) : null}

          <CommentSection postId={post.id} initialComments={comments} user={user} />
        </article>

        <aside className="grid gap-4 lg:sticky lg:top-24">
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <Avatar author={post.author} size={46} />
              <div className="min-w-0">
                <Link
                  href={`/u/${post.author.login}`}
                  className="block truncate text-sm font-semibold text-white transition hover:text-aurora-mint"
                >
                  {post.author.name}
                </Link>
                <span className="block truncate text-xs text-faint">@{post.author.login}</span>
              </div>
            </div>

            {authorProfile?.bio ? (
              <p className="mt-3 text-xs leading-relaxed text-dim">{authorProfile.bio}</p>
            ) : null}

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-3">
              {[
                { label: 'posts', value: authorProfile?.contributions.posts ?? 0 },
                { label: 'replies', value: authorProfile?.contributions.comments ?? 0 },
                { label: 'upvotes', value: authorProfile?.contributions.votesReceived ?? 0 },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-sm font-semibold text-white">{stat.value}</div>
                  <div className="text-[0.62rem] uppercase tracking-[0.12em] text-faint">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/u/${post.author.login}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[0.7rem] text-slate-300 transition hover:border-white/25 hover:text-white"
              >
                <Icon name="user" className="h-3.5 w-3.5" />
                Profile
              </Link>
              {authorProfile?.githubUrl ? (
                <a
                  href={authorProfile.githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[0.7rem] text-slate-300 transition hover:border-white/25 hover:text-white"
                >
                  <Icon name="github" className="h-3.5 w-3.5" />
                  GitHub
                </a>
              ) : null}
            </div>
          </GlassCard>

          {post.repoUrl ? (
            <GlassCard className="p-5">
              <div className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint">
                <Icon name="gitFork" className="h-3.5 w-3.5" />
                Where the work happens
              </div>
              <p className="break-all font-mono text-xs text-slate-300">
                {post.repoName ?? post.repoUrl}
              </p>
              <a
                href={post.repoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,var(--color-aurora-mint),var(--color-aurora-sky)_45%,var(--color-aurora-violet))] text-xs font-semibold text-ink-950 transition hover:brightness-110"
              >
                <Icon name="github" className="h-3.5 w-3.5" />
                Open on GitHub
                <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
              </a>
            </GlassCard>
          ) : null}

          <GlassCard className="p-5">
            <div className="mb-3 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint">
              <Icon name="waypoints" className="h-3.5 w-3.5" />
              Picking this up
            </div>
            <ol className="grid gap-2.5 text-xs text-dim">
              {[
                'Say hello in the comments so nobody duplicates the work.',
                'Ask for the scope you cannot infer — reviewers prefer questions to rewrites.',
                'Open a draft pull request early, even if it is three lines.',
              ].map((step, index) => (
                <li key={step} className="flex gap-2.5">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/15 text-[0.6rem] font-semibold text-slate-300">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="mt-4 border-t border-white/[0.07] pt-3 text-[0.68rem] text-faint">
              Posted {postedLabel}
              {post.updatedAt !== post.createdAt ? ` · last activity ${timeAgo(post.updatedAt)}` : ''}
            </div>
          </GlassCard>

          <div className="px-1">
            <ButtonLink href="/feed" variant="ghost" size="sm" className="w-full">
              <Icon name="compass" className="h-3.5 w-3.5" />
              Keep exploring
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
