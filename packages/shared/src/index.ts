/**
 * The single source of truth for the wire contract between the NestJS API and
 * the Next.js client. Both apps import these types directly.
 */

export const POST_TYPES = ['opportunity', 'idea', 'discussion'] as const;
export type PostType = (typeof POST_TYPES)[number];

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const SORTS = ['newest', 'top', 'discussed'] as const;
export type Sort = (typeof SORTS)[number];

export type Author = {
  id: string;
  login: string;
  name: string;
  avatarUrl: string | null;
  isDemo: boolean;
};

export type ProjectRef = {
  id: string;
  slug: string;
  name: string;
};

export type Post = {
  id: string;
  type: PostType;
  title: string;
  body: string;
  tags: string[];
  skills: string[];
  repoUrl: string | null;
  repoName: string | null;
  difficulty: Difficulty | null;
  project: ProjectRef | null;
  author: Author;
  createdAt: string;
  updatedAt: string;
  votes: number;
  commentCount: number;
  viewerVoted: boolean;
  viewerIsAuthor: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  body: string;
  author: Author;
  createdAt: string;
  viewerIsAuthor: boolean;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  repoUrl: string | null;
  tags: string[];
  owner: Author;
  createdAt: string;
  discussionCount: number;
  commentCount: number;
  lastActivityAt: string;
};

export type PublicUser = Author & {
  bio: string | null;
  location: string | null;
  githubUrl: string | null;
  createdAt: string;
  contributions: {
    posts: number;
    ideas: number;
    discussions: number;
    comments: number;
    votesReceived: number;
  };
};

export type Stats = {
  contributors: number;
  opportunities: number;
  ideas: number;
  discussions: number;
  projects: number;
  comments: number;
  votes: number;
};

export type TagCount = {
  tag: string;
  count: number;
};

export type RepoPreview = {
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  openIssues: number;
  goodFirstIssues: number;
  url: string;
  topics: string[];
  license: string | null;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type SessionInfo = {
  user: PublicUser;
};

export type AuthConfig = {
  github: boolean;
  demo: boolean;
  store: 'postgres' | 'memory';
};

export type PostInput = {
  type: PostType;
  title: string;
  body: string;
  tags?: string[];
  skills?: string[];
  repoUrl?: string | null;
  repoName?: string | null;
  difficulty?: Difficulty | null;
  projectId?: string | null;
};

export type PostQuery = {
  type?: PostType | 'all';
  tag?: string;
  q?: string;
  author?: string;
  project?: string;
  sort?: Sort;
  page?: number;
  pageSize?: number;
};

export type ProjectInput = {
  name: string;
  description: string;
  repoUrl?: string | null;
  tags?: string[];
};

export type GitHubUserInfo = {
  id: string;
  login: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  htmlUrl: string;
};

export const PAGE_SIZE = 9;
