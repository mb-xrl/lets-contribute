import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { POST_TYPES, type PostType } from '@lets-contribute/shared';
import { Composer } from '@/components/composer';
import { Pill } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { getProjects, getSession, getTags } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Share something',
  description: 'Post a contribution opportunity, an idea, or a project discussion.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function NewPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const user = await getSession();

  const rawType = first(params.type);
  const projectSlug = first(params.project);
  const suggestedType: PostType =
    rawType && (POST_TYPES as readonly string[]).includes(rawType) ? (rawType as PostType) : 'opportunity';

  if (!user) {
    const search = new URLSearchParams();
    if (rawType) search.set('type', rawType);
    if (projectSlug) search.set('project', projectSlug);
    const target = search.toString() ? `/new?${search.toString()}` : '/new';
    redirect(`/login?next=${encodeURIComponent(target)}`);
  }

  const [projects, tags] = await Promise.all([getProjects(), getTags()]);

  return (
    <div className="pt-10 sm:pt-14">
      <div className="mb-7">
        <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-aurora-mint/80">
          <Icon name="penLine" className="h-3.5 w-3.5" />
          New post
        </div>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Share something useful</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">
          Three things make a post work here: a title someone can act on, the scope you already know,
          and an honest note about what you are unsure of.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Pill icon="user" tone="sky">
            Posting as {user.name}
            {user.isDemo ? ' (demo session)' : ''}
          </Pill>
          {user.isDemo ? (
            <span className="rounded-full border border-amber-300/25 bg-amber-400/[0.07] px-3 py-1 text-[0.68rem] text-amber-100">
              Demo posts live in memory and reset when the API restarts.
            </span>
          ) : null}
        </div>
      </div>

      <Composer
        initialType={suggestedType}
        initialProjectSlug={projectSlug}
        projects={projects}
        tagSuggestions={tags.slice(0, 10).map((tag) => tag.tag)}
      />
    </div>
  );
}
