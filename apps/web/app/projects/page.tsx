import type { Metadata } from 'next';
import Link from 'next/link';
import { ProjectForm } from '@/components/project-form';
import { Avatar, GlassCard, Pill, TagChip } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { getProjects, getSession } from '@/lib/api';
import { plural, timeAgo } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Open-source projects looking for contributors, with their discussions in one place.',
};

export default async function ProjectsPage() {
  const [projects, user] = await Promise.all([getProjects(), getSession()]);

  return (
    <div className="pt-10 sm:pt-14">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-aurora-mint/80">
            <Icon name="boxes" className="h-3.5 w-3.5" />
            Projects
          </div>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Where the work lives</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">
            Every project is a small, deliberate bet: a repository, a maintainer, and a public
            discussion history. Pick one and read the threads before you open a pull request.
          </p>
        </div>
        <Pill icon="folder" tone="violet">
          {projects.length} {plural(projects.length, 'project')}
        </Pill>
      </div>

      <div className="mb-6">
        <ProjectForm user={user} />
      </div>

      {projects.length === 0 ? (
        <GlassCard className="px-6 py-14 text-center">
          <Icon name="folder" className="mx-auto h-6 w-6 text-slate-500" />
          <h2 className="mt-3 text-base font-semibold text-white">No projects yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-dim">
            Add the first one and give contributors a place to gather.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <GlassCard key={project.id} hover className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-white">
                    <Link href={`/projects/${project.slug}`} className="transition hover:text-aurora-mint">
                      {project.name}
                    </Link>
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-faint">
                    <Avatar author={project.owner} size={16} />
                    <span className="truncate">maintained by {project.owner.name}</span>
                  </div>
                </div>
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${project.name} repository`}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/25 hover:text-white"
                  >
                    <Icon name="github" className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>

              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-dim">
                {project.description}
              </p>

              {project.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.slice(0, 4).map((tag) => (
                    <TagChip key={tag} tag={tag} href={`/feed?tag=${encodeURIComponent(tag)}`} />
                  ))}
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-3 text-[0.7rem] text-faint">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="messages" className="h-3.5 w-3.5 opacity-70" />
                  {project.discussionCount} {plural(project.discussionCount, 'thread')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="messageSquare" className="h-3.5 w-3.5 opacity-70" />
                  {project.commentCount} {plural(project.commentCount, 'reply', 'replies')}
                </span>
                <span className="inline-flex items-center justify-end gap-1.5">
                  <Icon name="clock" className="h-3.5 w-3.5 opacity-70" />
                  {timeAgo(project.lastActivityAt)}
                </span>
              </div>

              <Link
                href={`/projects/${project.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-200 transition hover:text-white"
              >
                Read the discussions
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
