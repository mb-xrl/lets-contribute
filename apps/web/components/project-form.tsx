'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Project, PublicUser } from '@lets-contribute/shared';
import { apiFetch } from '@/lib/client';
import { Button, GlassCard, Spinner } from './ui/primitives';
import { Icon } from './ui/icon';

export function ProjectForm({ user }: { user: PublicUser | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [tags, setTags] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);

    const result = await apiFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        repoUrl: repoUrl.trim() || undefined,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 8),
      }),
    });

    setPending(false);
    if (result.ok) {
      setName('');
      setDescription('');
      setRepoUrl('');
      setTags('');
      setOpen(false);
      router.push(`/projects/${result.data.slug}`);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  if (!user) {
    return (
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-dim">
            <Icon name="folder" className="h-4 w-4 text-aurora-violet" />
            Have a project people can contribute to?
          </p>
          <a
            href="/login?next=/projects"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-4 text-xs font-medium text-slate-100 transition hover:border-white/30 hover:bg-white/[0.1]"
          >
            <Icon name="github" className="h-3.5 w-3.5" />
            Sign in to add it
          </a>
        </div>
      </GlassCard>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="glass-soft flex w-full items-center gap-3 rounded-3xl px-5 py-4 text-left transition hover:border-white/25"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06]">
            <Icon name="plus" className="h-4 w-4 text-aurora-mint" strokeWidth={2.2} />
          </span>
          <span className="text-sm">
            <span className="block font-medium text-slate-100">Add a project</span>
            <span className="block text-xs text-faint">
              Give contributors a permanent home for opportunities and discussions.
            </span>
          </span>
          <Icon name="chevronRight" className="ml-auto h-4 w-4 text-slate-500" />
        </button>
      ) : (
        <GlassCard className="p-5">
          <form onSubmit={submit} className="grid gap-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Icon name="folder" className="h-4 w-4 text-aurora-violet" />
                New project
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            </div>

            <label className="grid gap-1.5">
              <span className="text-[0.7rem] uppercase tracking-[0.14em] text-faint">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="Orbit UI"
                className="field"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[0.7rem] uppercase tracking-[0.14em] text-faint">
                What is it, in two sentences?
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                minLength={10}
                maxLength={600}
                rows={3}
                placeholder="Accessible React primitives with an optional glass layer. Needs help with keyboard navigation and docs."
                className="field resize-y"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-[0.7rem] uppercase tracking-[0.14em] text-faint">
                  Repository (optional)
                </span>
                <input
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  placeholder="https://github.com/you/project"
                  className="field"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[0.7rem] uppercase tracking-[0.14em] text-faint">
                  Tags (comma separated)
                </span>
                <input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="react, accessibility"
                  className="field"
                />
              </label>
            </div>

            {error ? <p className="text-xs text-rose-300">{error}</p> : null}

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? <Spinner /> : <Icon name="plus" className="h-3.5 w-3.5" />}
                Create project
              </Button>
            </div>
          </form>
        </GlassCard>
      )}
    </div>
  );
}
