'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  DIFFICULTIES,
  POST_TYPES,
  type Difficulty,
  type Post,
  type PostType,
  type Project,
  type RepoPreview,
} from '@lets-contribute/shared';
import { cn } from '@/lib/cn';
import { apiFetch } from '@/lib/client';
import { compactNumber } from '@/lib/format';
import { Markdown } from './markdown';
import { Button, GlassCard, Spinner } from './ui/primitives';
import { Icon, difficultyIcon, iconForTag, postTypeIcon, postTypeLabel, type IconName } from './ui/icon';

const typeCopy: Record<PostType, { blurb: string; placeholder: string }> = {
  opportunity: {
    blurb: 'Work a maintainer wants done: scoped, labelled, with a reviewer attached.',
    placeholder:
      'What needs doing?\n\n## Why it matters\n\n## What you will touch\n\n- file or package\n- tests\n\nHow to start, and who reviews it.',
  },
  idea: {
    blurb: 'A thought worth pressure-testing before anyone writes code.',
    placeholder:
      'The idea, in a paragraph.\n\n## What problem it solves\n\n## Open questions\n\n- the thing you are unsure about',
  },
  discussion: {
    blurb: 'A decision to make together: architecture, licensing, process.',
    placeholder:
      'The question you want answered.\n\n## Options on the table\n\n- option one\n- option two\n\nWhat you lean towards, and why.',
  },
};

function TagInput({
  label,
  hint,
  values,
  onChange,
  placeholder,
  suggestions = [],
  max = 8,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  suggestions?: string[];
  max?: number;
}) {
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    const cleaned = raw.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-');
    if (!cleaned || values.includes(cleaned) || values.length >= max) return;
    onChange([...values, cleaned]);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit(draft);
      setDraft('');
    } else if (event.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  const unused = suggestions.filter((tag) => !values.includes(tag)).slice(0, 6);

  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-faint">{label}</span>
        {hint ? <span className="text-[0.68rem] text-faint">{hint}</span> : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 transition focus-within:border-sky-300/40 focus-within:bg-white/[0.06]">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.07] px-2 py-0.5 text-[0.7rem] text-slate-200"
          >
            <Icon name={iconForTag(value)} className="h-3 w-3 opacity-70" />
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              aria-label={`Remove ${value}`}
              className="ml-0.5 text-slate-500 transition hover:text-rose-300"
            >
              <Icon name="x" className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            commit(draft);
            setDraft('');
          }}
          placeholder={values.length === 0 ? placeholder : ''}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {unused.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {unused.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => commit(tag)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/12 px-2 py-0.5 text-[0.68rem] text-slate-400 transition hover:border-white/30 hover:text-white"
            >
              <Icon name="plus" className="h-2.5 w-2.5" />
              {tag}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Composer({
  initialType,
  initialProjectSlug,
  projects,
  tagSuggestions,
}: {
  initialType: PostType;
  initialProjectSlug?: string;
  projects: Project[];
  tagSuggestions: string[];
}) {
  const router = useRouter();

  const [type, setType] = useState<PostType>(initialType);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [projectSlug, setProjectSlug] = useState(initialProjectSlug ?? '');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoName, setRepoName] = useState('');
  const [preview, setPreview] = useState<RepoPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function importRepo() {
    if (!repoUrl.trim() || previewLoading) return;
    setPreviewLoading(true);
    setPreviewError(null);
    const result = await apiFetch<{ repo: RepoPreview | null }>(
      `/meta/repo-preview?input=${encodeURIComponent(repoUrl.trim())}`,
    );
    setPreviewLoading(false);
    if (result.ok && result.data.repo) {
      setPreview(result.data.repo);
      setRepoName(result.data.repo.fullName);
      if (tags.length === 0 && result.data.repo.topics.length > 0) {
        setTags(result.data.repo.topics.slice(0, 4));
      }
    } else {
      setPreviewError(
        result.ok ? 'Could not read that repository (private, or rate limited).' : result.error,
      );
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;

    if (title.trim().length < 6) {
      setError('Give it a title of at least 6 characters.');
      return;
    }
    if (body.trim().length < 10) {
      setError('A couple of sentences, at least.');
      return;
    }

    setPending(true);
    setError(null);

    const result = await apiFetch<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify({
        type,
        title: title.trim(),
        body: body.trim(),
        tags,
        skills,
        difficulty: type === 'opportunity' ? difficulty : undefined,
        projectSlug: projectSlug || undefined,
        repoUrl: repoUrl.trim() || undefined,
        repoName: repoName.trim() || undefined,
      }),
    });

    setPending(false);
    if (result.ok) {
      router.push(`/p/${result.data.id}`);
      router.refresh();
    } else if (result.status === 401) {
      router.push('/login?next=/new');
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_0.5fr] lg:items-start">
      <div className="grid gap-5">
        {/* type */}
        <GlassCard className="p-4 sm:p-5">
          <div className="grid gap-2 sm:grid-cols-3">
            {POST_TYPES.map((option) => {
              const active = type === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col gap-1 rounded-2xl border p-3.5 text-left transition',
                    active
                      ? 'border-white/30 bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      name={postTypeIcon[option]}
                      className={cn('h-4 w-4', active ? 'text-aurora-mint' : 'text-slate-400')}
                    />
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        active ? 'text-white' : 'text-slate-300',
                      )}
                    >
                      {postTypeLabel[option]}
                    </span>
                  </span>
                  <span className="text-[0.68rem] leading-snug text-faint">
                    {typeCopy[option].blurb}
                  </span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* title + body */}
        <GlassCard className="p-5">
          <label className="grid gap-1.5">
            <span className="flex items-baseline justify-between">
              <span className="text-[0.7rem] uppercase tracking-[0.14em] text-faint">Title</span>
              <span className="text-[0.68rem] text-faint">{title.length}/160</span>
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value.slice(0, 160))}
              placeholder={
                type === 'opportunity'
                  ? 'Add keyboard navigation to the Combobox primitive'
                  : type === 'idea'
                    ? 'Weekly “first PR” pairing rooms'
                    : 'Should the glass layer be opt-in or the default?'
              }
              className="field text-[0.95rem]"
              required
            />
          </label>

          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] uppercase tracking-[0.14em] text-faint">Details</span>
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-0.5">
                {(['write', 'preview'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTab(option)}
                    className={cn(
                      'inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[0.68rem] font-medium capitalize transition',
                      tab === option
                        ? 'bg-white/[0.12] text-white'
                        : 'text-slate-400 hover:text-slate-200',
                    )}
                  >
                    <Icon name={option === 'write' ? 'penLine' : 'eye'} className="h-3 w-3" />
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'write' ? (
              <>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value.slice(0, 6000))}
                  rows={14}
                  placeholder={typeCopy[type].placeholder}
                  className="field resize-y leading-relaxed"
                  required
                />
                <div className="flex items-center justify-between text-[0.68rem] text-faint">
                  <span>Markdown-lite: **bold**, `code`, - lists, ## headings</span>
                  <span>{body.length}/6000</span>
                </div>
              </>
            ) : (
              <div className="min-h-[18rem] rounded-xl border border-white/10 bg-white/[0.03] p-4">
                {body.trim() ? (
                  <Markdown content={body} />
                ) : (
                  <p className="text-sm text-faint">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>
        </GlassCard>

        {/* taxonomy */}
        <GlassCard className="grid gap-4 p-5">
          <TagInput
            label="Tags"
            hint="up to 8 · press Enter"
            values={tags}
            onChange={setTags}
            placeholder="good-first-issue, accessibility…"
            suggestions={tagSuggestions}
          />
          <TagInput
            label="Skills in play"
            hint="what a contributor needs"
            values={skills}
            onChange={setSkills}
            placeholder="TypeScript, React…"
            suggestions={['TypeScript', 'React', 'Python', 'Rust', 'Postgres', 'Design']}
            max={6}
          />

          {type === 'opportunity' ? (
            <div className="grid gap-1.5">
              <span className="text-[0.7rem] uppercase tracking-[0.14em] text-faint">
                Difficulty
              </span>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDifficulty(option)}
                    aria-pressed={difficulty === option}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs capitalize transition',
                      difficulty === option
                        ? 'border-white/30 bg-white/[0.12] text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white',
                    )}
                  >
                    <Icon
                      name={(difficultyIcon[option] ?? 'sprout') as IconName}
                      className="h-3.5 w-3.5"
                    />
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </GlassCard>
      </div>

      {/* sidebar */}
      <aside className="grid gap-4 lg:sticky lg:top-24">
        <GlassCard className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Icon name="gitFork" className="h-4 w-4 text-aurora-sky" />
            GitHub
          </h3>

          <label className="mt-3 grid gap-1.5">
            <span className="text-[0.68rem] uppercase tracking-[0.14em] text-faint">
              Issue or repository
            </span>
            <div className="flex gap-1.5">
              <input
                value={repoUrl}
                onChange={(event) => {
                  setRepoUrl(event.target.value);
                  setPreview(null);
                  setPreviewError(null);
                  setRepoName('');
                }}
                placeholder="https://github.com/org/repo/issues/12"
                className="field min-w-0 flex-1 text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={importRepo}
                disabled={previewLoading || repoUrl.trim().length === 0}
                title="Read repository metadata from GitHub"
                className="shrink-0"
              >
                {previewLoading ? <Spinner /> : <Icon name="search" className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </label>

          {previewError ? <p className="mt-2 text-[0.68rem] text-amber-200">{previewError}</p> : null}

          {preview ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                <Icon name="github" className="h-3.5 w-3.5" />
                <span className="truncate">{preview.fullName}</span>
              </div>
              {preview.description ? (
                <p className="mt-1.5 line-clamp-2 text-[0.68rem] leading-relaxed text-dim">
                  {preview.description}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] text-faint">
                <span className="inline-flex items-center gap-1">
                  <Icon name="star" className="h-3 w-3" />
                  {compactNumber(preview.stars)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="gitFork" className="h-3 w-3" />
                  {compactNumber(preview.forks)}
                </span>
                {preview.language ? (
                  <span className="inline-flex items-center gap-1">
                    <Icon name="code" className="h-3 w-3" />
                    {preview.language}
                  </span>
                ) : null}
                {preview.goodFirstIssues > 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-200">
                    <Icon name="sprout" className="h-3 w-3" />
                    {preview.goodFirstIssues} good first issues
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <p className="mt-3 text-[0.66rem] leading-relaxed text-faint">
            Optional. Reading the repo pulls public metadata (stars, topics) so contributors know what
            they are walking into.
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Icon name="folder" className="h-4 w-4 text-aurora-violet" />
            Project
          </h3>
          <label className="mt-3 grid gap-1.5">
            <span className="sr-only">Project</span>
            <select
              value={projectSlug}
              onChange={(event) => setProjectSlug(event.target.value)}
              className="field text-xs"
            >
              <option value="">No project — standalone post</option>
              {projects.map((project) => (
                <option key={project.id} value={project.slug}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-[0.66rem] leading-relaxed text-faint">
            Linking a project keeps opportunities and discussions together.
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          {error ? (
            <p className="mb-3 flex items-start gap-1.5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-[0.7rem] text-rose-200">
              <Icon name="triangleAlert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? <Spinner /> : <Icon name="send" className="h-4 w-4" />}
            Publish {postTypeLabel[type].toLowerCase()}
          </Button>
          <p className="mt-2.5 text-center text-[0.66rem] leading-relaxed text-faint">
            Posted publicly under your GitHub handle. Edit or delete it later from the post page.
          </p>
        </GlassCard>
      </aside>
    </form>
  );
}
