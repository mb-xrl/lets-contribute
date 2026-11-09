import type {
  Comment,
  Difficulty,
  Paginated,
  Post,
  PostInput,
  PostQuery,
  PostType,
  Project,
  ProjectInput,
  PublicUser,
  Stats,
  TagCount,
} from '@lets-contribute/shared';

export const STORE = Symbol('STORE');

export type StoredUser = {
  id: string;
  githubId: string | null;
  login: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  githubUrl: string | null;
  isDemo: boolean;
  createdAt: string;
};

export type GitHubProfile = {
  id: string;
  login: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  htmlUrl: string;
};

export type StoredPost = {
  id: string;
  authorId: string;
  type: PostType;
  title: string;
  body: string;
  tags: string[];
  skills: string[];
  repoUrl: string | null;
  repoName: string | null;
  difficulty: Difficulty | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredComment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type StoredProject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  repoUrl: string | null;
  tags: string[];
  ownerId: string;
  createdAt: string;
};

export type CreatePostInput = PostInput;

export type StoreStatus = {
  kind: 'postgres' | 'memory';
  ready: boolean;
  detail: string;
};

export interface Store {
  readonly kind: 'postgres' | 'memory';

  /** Creates the schema if it is missing. Safe to call on every cold start. */
  migrate(): Promise<void>;
  status(): StoreStatus;

  // users
  upsertGitHubUser(profile: GitHubProfile): Promise<StoredUser>;
  createDemoUser(): Promise<StoredUser>;
  findUserById(id: string): Promise<StoredUser | null>;
  findUserByLogin(login: string): Promise<StoredUser | null>;
  updateProfile(id: string, patch: { bio?: string; location?: string }): Promise<StoredUser>;
  getPublicUser(login: string): Promise<PublicUser | null>;

  // posts
  listPosts(query: PostQuery, viewerId: string | null): Promise<Paginated<Post>>;
  getPost(id: string, viewerId: string | null): Promise<Post | null>;
  createPost(authorId: string, input: CreatePostInput): Promise<Post>;
  deletePost(id: string, authorId: string): Promise<boolean>;
  toggleVote(postId: string, userId: string): Promise<{ votes: number; voted: boolean } | null>;

  // comments
  listComments(postId: string, viewerId: string | null): Promise<Comment[]>;
  createComment(postId: string, authorId: string, body: string): Promise<Comment | null>;
  deleteComment(id: string, authorId: string): Promise<boolean>;

  // projects
  listProjects(viewerId: string | null): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  createProject(ownerId: string, input: ProjectInput): Promise<Project>;

  // meta
  stats(): Promise<Stats>;
  listTags(): Promise<TagCount[]>;
  listContributors(limit?: number): Promise<PublicUser[]>;
  seedIfEmpty(): Promise<{ seeded: boolean }>;
}
