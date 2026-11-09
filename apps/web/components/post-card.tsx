import Link from 'next/link';
import type { Post } from '@lets-contribute/shared';
import { excerpt, timeAgo } from '@/lib/format';
import { Avatar, DifficultyChip, GlassCard, TagChip, TypeChip } from './ui/primitives';
import { Icon } from './ui/icon';
import { VoteButton } from './vote-button';

export function PostCard({ post, authed }: { post: Post; authed: boolean }) {
  return (
    <GlassCard hover className="relative flex gap-4 p-5 sm:gap-5 sm:p-6">
      <div className="hidden shrink-0 sm:block">
        <VoteButton
          postId={post.id}
          votes={post.votes}
          voted={post.viewerVoted}
          authed={authed}
        />
      </div>

      <div className="min-w-0 flex-1">
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
          <span className="ml-auto inline-flex items-center gap-1 text-[0.7rem] text-faint">
            <Icon name="clock" className="h-3 w-3" />
            {timeAgo(post.createdAt)}
          </span>
        </div>

        <h3 className="mt-3 text-[1.05rem] font-semibold leading-snug text-slate-50">
          <Link href={`/p/${post.id}`} className="transition hover:text-white">
            {post.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-dim">
          {excerpt(post.body, 220)}
        </p>

        {post.tags.length > 0 ? (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <TagChip key={tag} tag={tag} href={`/feed?tag=${encodeURIComponent(tag)}`} />
            ))}
            {post.tags.length > 4 ? (
              <span className="inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 text-[0.7rem] text-faint">
                +{post.tags.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <Link
            href={`/u/${post.author.login}`}
            className="group inline-flex min-w-0 items-center gap-2"
          >
            <Avatar author={post.author} size={26} />
            <span className="min-w-0 truncate text-xs text-slate-300 group-hover:text-white">
              {post.author.name}
              <span className="text-faint"> · @{post.author.login}</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {post.repoName ? (
              <span className="hidden items-center gap-1.5 sm:inline-flex" title={post.repoName}>
                <Icon name="gitFork" className="h-3.5 w-3.5 opacity-70" />
                <span className="max-w-[10rem] truncate">{post.repoName.split('/')[1]}</span>
              </span>
            ) : null}
            <Link
              href={`/p/${post.id}#comments`}
              className="inline-flex items-center gap-1.5 transition hover:text-white"
            >
              <Icon name="messageSquare" className="h-3.5 w-3.5 opacity-70" />
              {post.commentCount}
            </Link>
            <span className="sm:hidden">
              <VoteButton
                postId={post.id}
                votes={post.votes}
                voted={post.viewerVoted}
                authed={authed}
                layout="inline"
              />
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
