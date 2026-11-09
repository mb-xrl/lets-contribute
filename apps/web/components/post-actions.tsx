'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/client';
import { Button } from './ui/primitives';
import { Icon } from './ui/icon';

export function PostActions({
  postId,
  isAuthor,
  url,
}: {
  postId: string;
  isAuthor: boolean;
  url: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function remove() {
    setPending(true);
    const result = await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
    setPending(false);
    if (result.ok) {
      router.push('/feed');
      router.refresh();
    } else {
      setError(result.error);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={copy}>
        <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />
        {copied ? 'Link copied' : 'Copy link'}
      </Button>

      {isAuthor ? (
        confirming ? (
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={remove} disabled={pending}>
              {pending ? <Icon name="loader" className="h-3.5 w-3.5 animate-spin" /> : null}
              Delete for good
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            <Icon name="trash" className="h-3.5 w-3.5" />
            Delete
          </Button>
        )
      ) : null}

      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </div>
  );
}
