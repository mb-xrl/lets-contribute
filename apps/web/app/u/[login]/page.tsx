import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostCard } from '@/components/post-card';
import { ProfileEditor } from '@/components/profile-editor';
import {
  Avatar,
  ButtonLink,
  EmptyState,
  GlassCard,
  Pill,
} from '@/components/ui/primitives';
import { Icon, type IconName } from '@/components/ui/icon';
import { getPosts, getSession, getUser } from '@/lib/api';
import { plural } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Params = Promise<{ login: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { login } = await params;
  const profile = await getUser(login);
  if (!profile) return { title: 'Contributor not found' };
  return {
    title: profile.name,
    description: profile.bio ?? `Contributions from ${profile.name} (@${profile.login}).`,
  };
}

export default async function ProfilePage({ params }: { params: Params }) {
  const { login } = await params;
  const [profile, viewer] = await Promise.all([getUser(login), getSession()]);
  if (!profile) notFound();

  const posts = await getPosts({ author: profile.login, sort: 'newest', pageSize: 24 });
  const isOwner = viewer?.login === profile.login;
  const joined = new Date(profile.createdAt).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });

  const stats: { icon: IconName; label: string; value: number }[] = [
    { icon: 'penLine', label: 'posts', value: profile.contributions.posts },
    { icon: 'lightbulb', label: 'ideas', value: profile.contributions.ideas },
    { icon: 'messages', label: 'discussions', value: profile.contributions.discussions },
    { icon: 'messageSquare', label: 'replies', value: profile.contributions.comments },
    { icon: 'arrowUp', label: 'upvotes earned', value: profile.contributions.votesReceived },
  ];

  return (
    <div className="pt-10 sm:pt-14">
      <GlassCard glow className="overflow-hidden">
        <div className="relative px-6 py-7 sm:px-8">
          <div className="pointer-events-none absolute inset-x-0 -top-28 h-52 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(110,231,208,0.18),transparent_70%)]" />

          <div className="relative flex flex-wrap items-start gap-5">
            <Avatar author={profile} size={72} className="shadow-[0_20px_50px_-25px_rgba(0,0,0,0.9)]" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-white">{profile.name}</h1>
                {profile.isDemo ? (
                  <Pill icon="info" tone="amber">
                    Demo session
                  </Pill>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-faint">@{profile.login}</p>

              {profile.bio ? (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-dim">{profile.bio}</p>
              ) : (
                <p className="mt-3 max-w-xl text-sm text-faint">
                  No bio yet.{' '}
                  {isOwner ? 'Add one below so people know what you work on.' : ''}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-faint">
                {profile.location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="mapPin" className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="calendar" className="h-3.5 w-3.5" />
                  joined {joined}
                </span>
                {profile.githubUrl ? (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-slate-300 transition hover:text-white"
                  >
                    <Icon name="github" className="h-3.5 w-3.5" />
                    GitHub profile
                    <Icon name="arrowUpRight" className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 border-t border-white/[0.08] pt-4 sm:w-auto sm:grid-cols-5 sm:border-0 sm:pt-0">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/[0.04] px-3 py-2">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <Icon name={stat.icon} className="h-3.5 w-3.5 text-aurora-mint" />
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-faint">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {isOwner && viewer ? (
        <div className="mt-4">
          <ProfileEditor user={viewer} />
        </div>
      ) : null}

      <div className="mb-4 mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Icon name="layers" className="h-4 w-4 text-aurora-violet" />
            Contributions
          </h2>
          <p className="mt-1 text-xs text-faint">
            {posts.total} {plural(posts.total, 'post')} · opportunities, ideas and discussions
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href={`/feed?author=${profile.login}`} variant="secondary" size="sm">
            In the feed
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </ButtonLink>
          {isOwner ? (
            <ButtonLink href="/new" size="sm">
              <Icon name="plus" className="h-3.5 w-3.5" />
              New post
            </ButtonLink>
          ) : null}
        </div>
      </div>

      {posts.items.length === 0 ? (
        <EmptyState
          icon="layers"
          title={isOwner ? 'You have not posted yet' : 'Nothing posted yet'}
          description={
            isOwner
              ? 'Share an opportunity, an idea, or a question you are sitting on. The board is more useful with your name in it.'
              : `When ${profile.name} posts something, it will show up here.`
          }
          action={
            isOwner ? (
              <ButtonLink href="/new" size="sm">
                <Icon name="plus" className="h-3.5 w-3.5" />
                Share something
              </ButtonLink>
            ) : (
              <ButtonLink href="/feed" variant="secondary" size="sm">
                <Icon name="compass" className="h-3.5 w-3.5" />
                Browse the board
              </ButtonLink>
            )
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {posts.items.map((post) => (
            <PostCard key={post.id} post={post} authed={Boolean(viewer)} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-faint">
        Looking for someone else?{' '}
        <Link href="/feed" className="text-slate-300 underline-offset-4 hover:underline">
          Browse the feed
        </Link>
      </p>
    </div>
  );
}
