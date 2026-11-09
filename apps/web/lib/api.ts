import { cookies } from 'next/headers';
import {
  PAGE_SIZE,
  type AuthConfig,
  type Comment,
  type Paginated,
  type Post,
  type PostQuery,
  type Project,
  type PublicUser,
  type Stats,
  type TagCount,
} from '@lets-contribute/shared';

/**
 * Server-side calls to the NestJS API. Session cookies are forwarded so pages
 * can render viewer-specific state (your vote, your posts) on the server.
 */
const apiOrigin = (process.env.API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');

async function serverGet<T>(path: string): Promise<T | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const response = await fetch(`${apiOrigin}/api${path}`, {
      headers: {
        accept: 'application/json',
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const emptyPage = (pageSize = PAGE_SIZE): Paginated<Post> => ({
  items: [],
  total: 0,
  page: 1,
  pageSize,
});

function toQueryString(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function getPosts(query: PostQuery): Promise<Paginated<Post>> {
  const result = await serverGet<Paginated<Post>>(
    `/posts${toQueryString({
      type: query.type && query.type !== 'all' ? query.type : undefined,
      tag: query.tag,
      q: query.q,
      author: query.author,
      project: query.project,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    })}`,
  );
  return result ?? emptyPage();
}

export async function getPost(id: string): Promise<Post | null> {
  return serverGet<Post>(`/posts/${encodeURIComponent(id)}`);
}

export async function getComments(id: string): Promise<Comment[]> {
  return (await serverGet<Comment[]>(`/posts/${encodeURIComponent(id)}/comments`)) ?? [];
}

export async function getProjects(): Promise<Project[]> {
  return (await serverGet<Project[]>('/projects')) ?? [];
}

export async function getProject(slug: string): Promise<Project | null> {
  return serverGet<Project>(`/projects/${encodeURIComponent(slug)}`);
}

export async function getStats(): Promise<Stats | null> {
  return serverGet<Stats>('/meta/stats');
}

export async function getTags(): Promise<TagCount[]> {
  return (await serverGet<TagCount[]>('/meta/tags')) ?? [];
}

export async function getContributors(limit = 8): Promise<PublicUser[]> {
  return (await serverGet<PublicUser[]>(`/meta/contributors?limit=${limit}`)) ?? [];
}

export async function getUser(login: string): Promise<PublicUser | null> {
  return serverGet<PublicUser>(`/users/${encodeURIComponent(login)}`);
}

export async function getSession(): Promise<PublicUser | null> {
  const result = await serverGet<{ user: PublicUser | null }>('/auth/me');
  return result?.user ?? null;
}

export async function getAuthConfig(): Promise<AuthConfig> {
  const fallback: AuthConfig = { github: false, demo: true, store: 'memory' };
  return (await serverGet<AuthConfig>('/auth/config')) ?? fallback;
}
