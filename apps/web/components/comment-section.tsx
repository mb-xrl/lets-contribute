'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { Comment, PublicUser } from '@lets-contribute/shared';
import { apiFetch } from '@/lib/client';
import { timeAgo } from '@/lib/format';
import { Markdown } from './markdown';
import { Avatar, Button, GlassCard, Spinner } from './ui/primitives';
import { Icon } from './ui/icon';

export function CommentSection({
  postId,
  initialComments,
  user,
}: {
  postId: string;
  initialComments: Comment[];
  user: PublicUser | null;
}) {
  const pathname = usePathname();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (trimmed.length === 0 || pending) return;

    setPending(true);
    setError(null);
    const result = await apiFetch<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: trimmed }),
    });

    if (result.ok) {
      setComments((current) => [...current, result.data]);
      setBody('');
    } else {
      setError(result.error);
    }
    setPending(false);
  }

  async function remove(commentId: string) {
    const previous = comments;
    setComments((current) => current.filter((comment) => comment.id !== commentId));
    const result = await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
    if (!result.ok) {
      setComments(previous);
      setError(result.error);
    }
  }

  return (
    <section id="comments" className="mt-10 scroll-mt-24">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="messageSquare" className="h-4 w-4 text-aurora-sky" />
        <h2 className="text-base font-semibold text-white">
          {comments.length === 0 ? 'No replies yet' : `${comments.length} ${comments.length === 1 ? 'reply' : 'replies'}`}
        </h2>
      </div>

      {user ? (
        <form onSubmit={submit} className="glass rounded-3xl p-4">
          <div className="flex gap-3">
            <Avatar author={user} size={34} className="mt-1 hidden sm:block" />
            <div className="min-w-0 flex-1">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value.slice(0, 2000))}
                rows={3}
                placeholder="Add context, ask a question, offer to pair…"
                className="field resize-y"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[0.7rem] text-faint">
                  Markdown-lite: **bold**, `code`, - lists
                  {body.length > 0 ? ` · ${body.length}/2000` : ''}
                </span>
                <Button type="submit" size="sm" disabled={pending || body.trim().length === 0}>
                  {pending ? <Spinner /> : <Icon name="send" className="h-3.5 w-3.5" />}
                  Reply
                </Button>
              </div>
              {error ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-300">
                  <Icon name="triangleAlert" className="h-3.5 w-3.5" />
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </form>
      ) : (
        <GlassCard className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-dim">
            <Icon name="messageCircle" className="h-4 w-4 text-aurora-sky" />
            Sign in to join the discussion.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-4 text-xs font-medium text-slate-100 transition hover:border-white/30 hover:bg-white/[0.1]"
          >
            <Icon name="github" className="h-3.5 w-3.5" />
            Sign in with GitHub
          </Link>
        </GlassCard>
      )}

      <div className="mt-4 grid gap-3">
        {comments.map((comment) => (
          <article key={comment.id} className="glass-soft rounded-2xl p-4">
            <header className="flex items-center gap-2.5">
              <Avatar author={comment.author} size={28} />
              <div className="min-w-0">
                <Link
                  href={`/u/${comment.author.login}`}
                  className="block truncate text-xs font-medium text-slate-200 transition hover:text-white"
                >
                  {comment.author.name}
                </Link>
                <span className="text-[0.68rem] text-faint">
                  {timeAgo(comment.createdAt)}
                  {comment.author.isDemo ? ' · demo session' : ''}
                </span>
              </div>
              {comment.viewerIsAuthor ? (
                <button
                  type="button"
                  onClick={() => remove(comment.id)}
                  aria-label="Delete your reply"
                  title="Delete your reply"
                  className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <Icon name="trash" className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </header>
            <Markdown content={comment.body} className="prose-lc mt-3 text-sm" />
          </article>
        ))}
      </div>
    </section>
  );
}
